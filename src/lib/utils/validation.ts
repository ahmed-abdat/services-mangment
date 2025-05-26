/**
 * File Validation Utilities
 * Lightweight validation functions for file uploads
 * Note: Form validation is handled by Zod schemas, UUID validation by Supabase/PostgreSQL
 */

/**
 * Validates file size
 * @param file - The file to validate
 * @param maxSizeInMB - Maximum size in megabytes (default: 5MB)
 * @returns object with isValid boolean and error message
 */
export function validateFileSize(
  file: File,
  maxSizeInMB = 5
): { isValid: boolean; error?: string } {
  const maxSize = maxSizeInMB * 1024 * 1024; // Convert to bytes

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size too large. Maximum size is ${maxSizeInMB}MB.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates file type for images
 * @param file - The file to validate
 * @param allowedTypes - Array of allowed MIME types (default: common image types)
 * @returns object with isValid boolean and error message
 */
export function validateImageFileType(
  file: File,
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
): { isValid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes
      .map((type) => type.split("/")[1])
      .join(", ");
    return {
      isValid: false,
      error: `Invalid file type. Only ${allowedExtensions} files are allowed.`,
    };
  }

  return { isValid: true };
}

/**
 * Comprehensive file validation for images
 * @param file - The file to validate
 * @param maxSizeInMB - Maximum size in megabytes (default: 5MB)
 * @returns object with isValid boolean and error message
 */
export function validateImageFile(
  file: File,
  maxSizeInMB = 5
): { isValid: boolean; error?: string } {
  // Validate file type first
  const typeValidation = validateImageFileType(file);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  // Validate file size
  const sizeValidation = validateFileSize(file, maxSizeInMB);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  return { isValid: true };
}
