"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  Service,
  ServiceCreate,
  ServicesInsert,
  ServicesUpdate,
  Thumbnail,
} from "../types/dashboard.types";

// Helper function to handle thumbnail storage
async function handleThumbnail(serviceId: string, thumbnail: Thumbnail | null) {
  if (!thumbnail?.file) return null;

  const supabase = await createClient();

  try {
    // Validate file type and size
    const file = thumbnail.file;
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const validTypes = ["jpg", "jpeg", "png", "webp"];

    if (!fileExt || !validTypes.includes(fileExt)) {
      throw new Error("Invalid file type. Only JPG, PNG and WebP are allowed.");
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      throw new Error("File size too large. Maximum size is 5MB.");
    }

    const fileName = `${serviceId}/${Date.now()}_${file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    )}`;

    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from("service_thumbnails")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading thumbnail:", uploadError);
      throw uploadError;
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("service_thumbnails").getPublicUrl(fileName);

    if (!publicUrl) {
      throw new Error("Failed to get public URL for uploaded file");
    }

    return {
      url: publicUrl,
      name: fileName, // Store the full path for easier deletion later
    };
  } catch (error) {
    console.error("Error in handleThumbnail:", error);
    throw error;
  }
}

// Add new service
export async function addService(service: ServiceCreate) {
  const supabase = await createClient();

  try {
    // Create the initial service without thumbnail
    const newService: ServicesInsert = {
      name: service.name.trim(),
      created_at: new Date().toISOString(),
      thumbnail_url: service.thumbnail_url || null,
    };

    const { data, error } = await supabase
      .from("services")
      .insert(newService)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/services");
    return { success: true, serviceId: data.id };
  } catch (error) {
    console.error("Error adding service:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create service",
    };
  }
}

// Get all services
export async function getServices() {
  const supabase = await createClient();

  try {
    const { data: services, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, services };
  } catch (error) {
    console.error("Error getting services:", error);
    return { success: false, services: [] };
  }
}

// Get single service
export async function getService(id: string) {
  if (!id) return { success: false, service: null };

  const supabase = await createClient();

  try {
    const { data: service, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return { success: true, service };
  } catch (error) {
    console.error("Error getting service:", error);
    return { success: false, service: null };
  }
}

// Delete service with best practices for error handling and cleanup
export async function deleteService(id: string, thumbnail: Thumbnail | null) {
  const supabase = await createClient();

  try {
    // Step 1: Validate input parameters early
    if (!id) {
      return {
        success: false,
        error: "Service ID is required for deletion",
      };
    }

    // Step 2: Check if service exists before attempting deletion
    const { data: existingService, error: checkError } = await supabase
      .from("services")
      .select("id, thumbnail_url")
      .eq("id", id)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        // Service not found
        return {
          success: false,
          error: "Service not found",
        };
      }
      console.error("Error checking service existence:", checkError);
      return {
        success: false,
        error: "Failed to verify service existence",
      };
    }

    // Step 3: Delete the service from the database first
    // This ensures we check permissions and existence before cleaning up storage
    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting service from database:", deleteError);
      return {
        success: false,
        error: `Failed to delete service: ${deleteError.message}`,
      };
    }

    // Step 4: Clean up thumbnail from storage if service deletion was successful
    // This prevents orphaned database entries if storage deletion fails
    if (thumbnail?.name) {
      try {
        const { error: storageError } = await supabase.storage
          .from("service_thumbnails")
          .remove([thumbnail.name]);

        if (storageError) {
          console.error("Error deleting thumbnail from storage:", storageError);
          // Don't fail the entire operation since service is already deleted
          // Log the warning but continue, as the main operation succeeded
          console.warn(
            `Service deleted successfully but failed to clean up thumbnail: ${thumbnail.name}. Error: ${storageError.message}`
          );
        } else {
          console.log(`Successfully deleted thumbnail: ${thumbnail.name}`);
        }
      } catch (storageError) {
        console.error(
          "Unexpected error during thumbnail cleanup:",
          storageError
        );
        // Don't throw - service deletion was successful, storage cleanup is secondary
      }
    }

    // Step 5: Revalidate the cache after successful deletion
    revalidatePath("/services");

    return {
      success: true,
      message: "Service deleted successfully",
    };
  } catch (error) {
    console.error("Unexpected error in deleteService:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting the service",
    };
  }
}

// Update service
export async function updateService(
  id: string,
  updates: {
    name?: string;
    thumbnail_url?: string;
  }
) {
  const supabase = await createClient();

  try {
    const updateData: Partial<ServicesUpdate> = {
      ...(updates.name && { name: updates.name }),
      ...(updates.thumbnail_url && { thumbnail_url: updates.thumbnail_url }),
      // Use updated_at if it exists in your schema
    };

    const { error } = await supabase
      .from("services")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/services");
    return { success: true };
  } catch (error) {
    console.error("Error updating service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
