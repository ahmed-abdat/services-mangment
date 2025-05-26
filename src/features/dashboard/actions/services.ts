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

// Delete service
export async function deleteService(id: string, thumbnail: Thumbnail | null) {
  const supabase = await createClient();

  try {
    // Delete thumbnail from storage if exists
    if (thumbnail?.name) {
      const { error: storageError } = await supabase.storage
        .from("service_thumbnails")
        .remove([thumbnail.name]); // Use the full path stored in name

      if (storageError) {
        console.error("Error deleting thumbnail:", storageError);
        throw storageError;
      }
    }

    // Delete all related accounts and users (cascade delete should handle this)
    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/services");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
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
