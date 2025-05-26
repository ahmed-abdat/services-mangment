/**
 * Thumbnail Management Utilities
 * Provides helper functions for handling thumbnail operations in Supabase Storage
 */

import { validateImageFile } from "./validation";

/**
 * Extract the storage path from a Supabase Storage public URL
 * @param thumbnailUrl - The public URL of the thumbnail
 * @returns The storage path (serviceId/filename) or null if extraction fails
 */
export function extractThumbnailStoragePath(
  thumbnailUrl: string
): string | null {
  try {
    // Parse the URL to extract the storage path
    const url = new URL(thumbnailUrl);
    const pathSegments = url.pathname.split("/");

    // Find the bucket name index in the path
    const bucketIndex = pathSegments.findIndex(
      (segment) => segment === "service_thumbnails"
    );

    if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
      // Extract the path after the bucket name (serviceId/filename)
      const storagePath = pathSegments.slice(bucketIndex + 1).join("/");
      return storagePath || null;
    }

    // Fallback: try to extract serviceId/filename pattern using regex
    const match = thumbnailUrl.match(
      /service_thumbnails\/([^\/]+\/[^\/]+\.[^\/]+)$/
    );
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting storage path from URL:", error);
    return null;
  }
}

/**
 * Validate if a file is a valid image for thumbnail upload
 * @param file - The file to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateThumbnailFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  // Use centralized validation with thumbnail-specific constraints
  return validateImageFile(file, THUMBNAIL_CONFIG.MAX_SIZE_MB);
}

/**
 * Generate a unique filename for thumbnail storage
 * @param serviceId - The service ID
 * @param originalFileName - The original filename
 * @returns Sanitized filename with timestamp
 */
export function generateThumbnailFileName(
  serviceId: string,
  originalFileName: string
): string {
  const fileExtension = originalFileName.split(".").pop()?.toLowerCase() || "";
  const baseName =
    originalFileName.substring(0, originalFileName.lastIndexOf(".")) ||
    originalFileName;
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9.-]/g, "_");

  return `${serviceId}/${Date.now()}_${sanitizedBaseName}.${fileExtension}`;
}

/**
 * Create a thumbnail object from URL and storage path
 * @param thumbnailUrl - The public URL of the thumbnail
 * @returns Thumbnail object or null if extraction fails
 */
export function createThumbnailFromUrl(
  thumbnailUrl: string | null
): { url: string; name: string } | null {
  if (!thumbnailUrl) {
    return null;
  }

  const storagePath = extractThumbnailStoragePath(thumbnailUrl);

  if (!storagePath) {
    console.warn(
      "Failed to extract storage path from thumbnail URL:",
      thumbnailUrl
    );
    return null;
  }

  return {
    url: thumbnailUrl,
    name: storagePath,
  };
}

/**
 * Constants for thumbnail management
 */
export const THUMBNAIL_CONFIG = {
  BUCKET_NAME: "service_thumbnails",
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_SIZE_MB: 5, // 5MB for validation utility
  ALLOWED_TYPES: ["jpg", "jpeg", "png", "webp"],
  CACHE_CONTROL: "3600",
} as const;
