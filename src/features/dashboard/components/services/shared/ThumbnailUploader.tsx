"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/ui/file-uploader";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateThumbnailFile } from "@/lib/utils/thumbnail";
import { toast } from "sonner";

interface ThumbnailUploaderProps {
  thumbnailFiles: File[];
  setThumbnailFiles: React.Dispatch<React.SetStateAction<File[]>>;
  uploadProgress: Record<string, number>;
  existingThumbnailUrl?: string | null;
  isRequired?: boolean;
  showValidation?: boolean;
  mode: "create" | "edit";
}

export default function ThumbnailUploader({
  thumbnailFiles,
  setThumbnailFiles,
  uploadProgress,
  existingThumbnailUrl,
  isRequired = false,
  showValidation = false,
  mode,
}: ThumbnailUploaderProps) {
  const [thumbnailError, setThumbnailError] = useState(false);

  const handleThumbnailUpload = async (files: File[]) => {
    if (!files.length) return;

    // Validate file using utility function
    const file = files[0];
    const validation = validateThumbnailFile(file);

    if (!validation.isValid) {
      toast.error(validation.error || "Invalid file");
      setThumbnailFiles([]);
      return;
    }

    // File is valid, keep it in state for later upload
    toast.success("File selected and ready for upload");
  };

  const showRequiredIndicator = isRequired && mode === "create";
  const hasValidationError =
    showValidation && isRequired && thumbnailFiles.length === 0;

  return (
    <Card
      className={cn("w-full mb-6", {
        "border-red-500": hasValidationError,
      })}
    >
      <CardHeader className="px-4 pt-3 pb-2">
        <CardTitle className="font-semibold text-lg">
          Service Thumbnail{" "}
          {showRequiredIndicator && <span className="text-red-500">*</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {/* Show existing thumbnail if available and no new files selected */}
        {existingThumbnailUrl &&
          thumbnailFiles.length === 0 &&
          !thumbnailError && (
            <div className="mb-4 relative w-full h-[200px] rounded-md overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={existingThumbnailUrl}
                alt="Current thumbnail"
                className="w-full h-full object-contain"
                onError={() => {
                  console.error("Failed to load thumbnail image");
                  setThumbnailError(true);
                }}
              />
            </div>
          )}

        {/* Show error state for existing thumbnail */}
        {existingThumbnailUrl &&
          thumbnailFiles.length === 0 &&
          thumbnailError && (
            <div className="mb-4 flex flex-col items-center justify-center p-4 border rounded-md bg-muted/20">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Unable to load current thumbnail. You can upload a new one.
              </p>
            </div>
          )}

        <FileUploader
          value={thumbnailFiles}
          onValueChange={setThumbnailFiles}
          onUpload={handleThumbnailUpload}
          progresses={uploadProgress}
          accept={{ "image/*": [] }}
          maxSize={1024 * 1024 * 5} // 5MB
        />

        {thumbnailFiles.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            File selected. Click &quot;
            {mode === "create" ? "Create New Service" : "Update Service"}&quot;
            to upload.
          </p>
        )}

        {/* Show validation message for required thumbnails */}
        {hasValidationError && (
          <p className="text-sm text-red-500 mt-2">
            Please upload a service thumbnail (required)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
