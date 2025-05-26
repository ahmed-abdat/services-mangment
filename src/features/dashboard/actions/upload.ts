"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  validateThumbnailFile,
  generateThumbnailFileName,
  THUMBNAIL_CONFIG,
} from "@/lib/utils/thumbnail";

// Function to upload a thumbnail and update the service with enhanced error handling
export async function uploadThumbnail(formData: FormData) {
  try {
    const supabase = await createClient();

    // Step 1: Early validation of required parameters
    const serviceId = formData.get("serviceId") as string;
    const file = formData.get("file") as File;
    const oldThumbnailName = formData.get("oldThumbnailName") as string | null;

    // Validate required fields
    if (!serviceId) {
      return {
        success: false,
        error: "Service ID is required for thumbnail upload",
      };
    }

    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: "A valid file is required for upload",
      };
    }

    // Step 2: Validate service exists before processing
    const { data: service, error: serviceCheckError } = await supabase
      .from("services")
      .select("id, thumbnail_url")
      .eq("id", serviceId)
      .single();

    if (serviceCheckError) {
      if (serviceCheckError.code === "PGRST116") {
        return {
          success: false,
          error: "Service not found",
        };
      }
      console.error("Error checking service existence:", serviceCheckError);
      return {
        success: false,
        error: "Failed to verify service existence",
      };
    }

    // Step 3: Validate file using utility function
    const validation = validateThumbnailFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || "Invalid file provided",
      };
    }

    // Step 4: Generate unique filename using utility function
    const fileName = generateThumbnailFileName(serviceId, file.name);

    // Step 5: Upload the new file first (before cleaning up old one)
    const { error: uploadError } = await supabase.storage
      .from(THUMBNAIL_CONFIG.BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: THUMBNAIL_CONFIG.CACHE_CONTROL,
        upsert: false, // Ensure unique filenames
      });

    if (uploadError) {
      console.error("Error uploading thumbnail:", uploadError);
      return {
        success: false,
        error: `Failed to upload thumbnail: ${uploadError.message}`,
      };
    }

    // Step 6: Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage
      .from(THUMBNAIL_CONFIG.BUCKET_NAME)
      .getPublicUrl(fileName);

    if (!publicUrl) {
      // Clean up uploaded file since we can't get the URL
      await supabase.storage
        .from(THUMBNAIL_CONFIG.BUCKET_NAME)
        .remove([fileName]);
      return {
        success: false,
        error: "Failed to generate public URL for uploaded thumbnail",
      };
    }

    // Step 7: Update the service with the new thumbnail URL
    const { error: updateError } = await supabase
      .from("services")
      .update({ thumbnail_url: publicUrl })
      .eq("id", serviceId);

    if (updateError) {
      console.error("Error updating service with thumbnail:", updateError);
      // Clean up uploaded file if database update fails
      try {
        await supabase.storage
          .from(THUMBNAIL_CONFIG.BUCKET_NAME)
          .remove([fileName]);
      } catch (cleanupError) {
        console.error(
          "Failed to cleanup uploaded file after DB error:",
          cleanupError
        );
      }
      return {
        success: false,
        error: `Failed to update service with new thumbnail: ${updateError.message}`,
      };
    }

    // Step 8: Clean up old thumbnail if exists (after successful update)
    if (oldThumbnailName) {
      try {
        const { error: deleteError } = await supabase.storage
          .from(THUMBNAIL_CONFIG.BUCKET_NAME)
          .remove([oldThumbnailName]);

        if (deleteError) {
          console.warn("Failed to delete old thumbnail:", deleteError);
          // Don't fail the operation since new upload was successful
        } else {
          console.log(
            `Successfully cleaned up old thumbnail: ${oldThumbnailName}`
          );
        }
      } catch (error) {
        console.warn("Error during old thumbnail cleanup:", error);
        // Continue without failing - new upload was successful
      }
    }

    // Step 9: Revalidate the cache after successful upload
    revalidatePath("/services");

    return {
      success: true,
      message: "Thumbnail uploaded successfully",
      thumbnail: {
        url: publicUrl,
        name: fileName, // Full storage path for reliable future operations
        fileName: file.name, // Original filename for display purposes
      },
    };
  } catch (error) {
    console.error("Unexpected error in uploadThumbnail:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during thumbnail upload",
    };
  }
}
