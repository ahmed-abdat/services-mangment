import { uploadThumbnail } from "@/features/dashboard/actions/upload";

/**
 * Progress management utilities for file uploads
 */
export class UploadProgressManager {
  private setUploadProgress: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;

  constructor(
    setUploadProgress: React.Dispatch<
      React.SetStateAction<Record<string, number>>
    >
  ) {
    this.setUploadProgress = setUploadProgress;
  }

  /**
   * Start upload progress simulation
   */
  startProgressSimulation(fileName: string): NodeJS.Timeout {
    const timer = setInterval(() => {
      this.setUploadProgress((prev) => {
        const currentProgress = prev[fileName] || 0;
        if (currentProgress >= 90) {
          clearInterval(timer);
          return prev;
        }
        return {
          ...prev,
          [fileName]: Math.min(currentProgress + 10, 90),
        };
      });
    }, 300);

    return timer;
  }

  /**
   * Complete upload progress
   */
  completeProgress(fileName: string): void {
    this.setUploadProgress((prev) => ({
      ...prev,
      [fileName]: 100,
    }));
  }
}

/**
 * Helper function to upload thumbnail using FormData
 */
export async function uploadThumbnailWithFormData(
  serviceId: string,
  file: File,
  oldThumbnailName?: string | null
) {
  const formData = new FormData();
  formData.append("serviceId", serviceId);
  formData.append("file", file);
  if (oldThumbnailName) {
    formData.append("oldThumbnailName", oldThumbnailName);
  }

  return await uploadThumbnail(formData);
}
