"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import type { UserResponse } from "@/types/user.types";

export async function isUserExist(email: string): Promise<UserResponse | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("auth_users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data?.id) {
    return null;
  }
  return data;
}
// use cache for a better performance
export const getUser = cache(async (): Promise<UserResponse | null> => {
  const supabase = await createClient();

  try {
    // Get the authenticated user from Supabase Auth
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth error:", error.message);
      return null;
    }

    // If no authenticated user, return null early
    if (!user) {
      return null;
    }

    // Try to get the user profile from the database
    const { data: profile, error: profileError } = await supabase
      .from("auth_users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError.message);

      return null;
    }

    // Return the profile if found
    if (profile) {
      return profile;
    }

    return null;
  } catch (error) {
    console.error("Unexpected error in getUser:", error);
    return null;
  }
});

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

export async function deleteProfile(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "User ID is required" };
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("auth_users")
      .delete()
      .eq("id", userId);
    if (error) {
      console.error("Error in deleteProfile:", error);
      return { success: false, error: error.message };
    }
    await signOut();
    return { success: true, error: undefined };
  } catch (error) {
    console.error("Error in deleteProfile:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Helper function to delete avatar image
export async function deleteAvatarImage(url: string | null) {
  if (!url || !url.includes("avatar_images")) return;

  const supabase = await createClient();

  try {
    // Extract the path after the bucket name
    const pathParts = url.split("avatar_images/").pop();
    if (!pathParts) return;

    const { error } = await supabase.storage
      .from("avatar_images")
      .remove([pathParts]);

    if (error) {
      console.error("Error deleting avatar:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteAvatarImage:", error);
    throw error;
  }
}

// Helper function to upload avatar image
async function uploadAvatarImage(file: File, userId: string) {
  const supabase = await createClient();

  // Validate file type for security
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type. Only ${allowedExtensions.join(
        ", "
      )} files are allowed.`
    );
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase();
  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    throw new Error(
      `Invalid file extension. Only ${allowedExtensions.join(
        ", "
      )} files are allowed.`
    );
  }

  // Check file size (limit to 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error("File size too large. Maximum size is 5MB.");
  }

  try {
    const filePath = `${userId}/${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatar_images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatar_images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error in uploadAvatarImage:", error);
    throw error;
  }
}

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  try {
    const avatarFile = formData.get("avatarFile") as File | null;
    const oldAvatarUrl = formData.get("oldAvatarUrl") as string | null;

    // Delete old avatar if it exists
    if (oldAvatarUrl) {
      try {
        await deleteAvatarImage(oldAvatarUrl);
      } catch (error) {
        console.error("Error during avatar deletion:", error);
        // Continue with upload if there is a new avatar
        if (!avatarFile) {
          return {
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete avatar",
          };
        }
      }
    }

    // If no new avatar file, just update the profile with null avatar_url
    if (!avatarFile) {
      const { error: updateError } = await supabase
        .from("auth_users")
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        return { error: updateError.message || "Failed to update profile" };
      }

      revalidatePath("/", "layout");
      return { success: true, avatarUrl: "" };
    }

    // Upload new avatar
    let publicUrl;
    try {
      publicUrl = await uploadAvatarImage(avatarFile, user.id);
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? `Failed to upload avatar: ${error.message}`
            : "Failed to upload avatar",
      };
    }

    // Update the profile with the new avatar URL
    const { error: updateError } = await supabase
      .from("auth_users")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating profile with avatar URL:", updateError);
      // Try to clean up the uploaded file
      try {
        await deleteAvatarImage(publicUrl);
      } catch (cleanupError) {
        console.error("Error cleaning up avatar file:", cleanupError);
      }
      return {
        error: `Failed to update profile with new avatar: ${
          updateError.message || "Unknown error"
        }`,
      };
    }

    revalidatePath("/", "layout");
    return { success: true, avatarUrl: publicUrl };
  } catch (error) {
    console.error("Error in avatar update process:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to process avatar update",
    };
  }
}

// Add new reusable functions
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getUserProfile(
  userId: string
): Promise<UserResponse | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("auth_users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in getUserProfile:", error);
    return null;
  }
}

// export async function updateUserProfile(data: ProfileData, userId?: string) {
//   const user = await getCurrentUser();
//   if (!userId) {
//     if (!user) return { error: "User not found", success: false };
//     userId = user.id;
//   }
//   const supabase = await createClient();
//   const table = "auth_users";

//   try {
//     const { error } = await supabase.from(table).update(data).eq("id", userId);

//     if (error) return { error: error.message, success: false };

//     revalidatePath("/", "layout");
//     return { success: true, error: null };
//   } catch (error) {
//     console.error(`Error updating profile:`, error);
//     return { error: `Failed to update profile` };
//   }
// }
