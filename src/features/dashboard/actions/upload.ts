"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Function to upload a thumbnail and update the service
export async function uploadThumbnail(formData: FormData) {
  try {
    const supabase = await createClient();

    // Extract data from FormData
    const serviceId = formData.get("serviceId") as string;
    const file = formData.get("file") as File;
    const oldThumbnailName = formData.get("oldThumbnailName") as string | null;

    if (!serviceId || !file) {
      return {
        success: false,
        error: "Missing required data for upload",
      };
    }

    // Validate file type
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const validTypes = ["jpg", "jpeg", "png", "webp"];

    if (!fileExt || !validTypes.includes(fileExt)) {
      return {
        success: false,
        error: "Invalid file type. Only JPG, PNG and WebP are allowed.",
      };
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "File size too large. Maximum size is 5MB.",
      };
    }

    // Delete old thumbnail if exists
    if (oldThumbnailName) {
      await supabase.storage
        .from("service_thumbnails")
        .remove([oldThumbnailName]);
    }

    // Create a unique filename
    const fileName = `${serviceId}/${Date.now()}_${file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    )}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from("service_thumbnails")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading thumbnail:", uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("service_thumbnails").getPublicUrl(fileName);

    // Update the service with the thumbnail URL
    const { error: updateError } = await supabase
      .from("services")
      .update({ thumbnail_url: publicUrl })
      .eq("id", serviceId);

    if (updateError) {
      console.error("Error updating service with thumbnail:", updateError);
      return { success: false, error: updateError.message };
    }

    revalidatePath("/services");
    return {
      success: true,
      thumbnail: {
        url: publicUrl,
        name: fileName, // This is the full storage path, more reliable than parsing URL
        fileName: file.name, // Original filename for display purposes
      },
    };
  } catch (error) {
    console.error("Error in uploadThumbnail:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
