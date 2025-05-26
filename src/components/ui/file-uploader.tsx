"use client";

import { FileIcon, Trash, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import Dropzone, {
  type DropzoneProps,
  type FileRejection,
} from "react-dropzone";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useControllableState } from "@/hooks/use-controllable-state";
import { cn, formatBytes } from "@/lib/utils";

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   * @type File[]
   * @default undefined
   * @example value={files}
   */
  value?: File[];

  /**
   * Function to be called when the value changes.
   * @type React.Dispatch<React.SetStateAction<File[]>>
   * @default undefined
   * @example onValueChange={(files) => setFiles(files)}
   */
  onValueChange?: React.Dispatch<React.SetStateAction<File[]>>;

  /**
   * Function to be called when files are uploaded.
   * @type (files: File[]) => Promise<void>
   * @default undefined
   * @example onUpload={(files) => uploadFiles(files)}
   */
  onUpload?: (files: File[]) => Promise<void>;

  /**
   * Progress of the uploaded files.
   * @type Record<string, number> | undefined
   * @default undefined
   * @example progresses={{ "file1.png": 50 }}
   */
  progresses?: Record<string, number>;

  /**
   * Accepted file types for the uploader.
   * @type { [key: string]: string[]}
   * @default
   * ```ts
   * { "image/*": [] }
   * ```
   * @example accept={["image/png", "image/jpeg"]}
   */
  accept?: DropzoneProps["accept"];

  /**
   * Maximum file size for the uploader.
   * @type number | undefined
   * @default 1024 * 1024 * 2 // 2MB
   * @example maxSize={1024 * 1024 * 2} // 2MB
   */
  maxSize?: DropzoneProps["maxSize"];

  /**
   * Maximum number of files for the uploader.
   * @type number | undefined
   * @default 1
   * @example maxFiles={5}
   */
  maxFiles?: DropzoneProps["maxFiles"];

  /**
   * Whether the uploader should accept multiple files.
   * @type boolean
   * @default false
   * @example multiple
   */
  multiple?: boolean;

  /**
   * Whether the uploader is disabled.
   * @type boolean
   * @default false
   * @example disabled
   */
  disabled?: boolean;
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    progresses,
    accept = { "image/*": [] },
    maxSize = 1024 * 1024 * 5, // 5MB by default
    maxFiles = 1, // Only one file by default
    multiple = false, // Single file upload by default
    disabled = false,
    className,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Always replace existing files for single-file mode
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setFiles(newFiles);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          const errorMessages = errors.map((e) => e.message).join(", ");
          toast.error(`${file.name}: ${errorMessages}`);
        });
      }

      if (onUpload && newFiles.length > 0) {
        setIsUploading(true);
        toast.promise(onUpload(newFiles), {
          loading: "uploading_files",
          success: () => {
            setIsUploading(false);
            return "upload_success";
          },
          error: (err) => {
            setIsUploading(false);
            return err.message || "upload_error";
          },
        });
      }
    },
    [onUpload, setFiles]
  );

  function onRemove() {
    if (!files || isUploading) return;
    setFiles([]);
    onValueChange?.([]);
  }

  // Revoke preview url when component unmounts
  React.useEffect(() => {
    return () => {
      if (!files) return;
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const isDisabled = disabled || isUploading;
  const hasFiles = files && files.length > 0;
  const file = hasFiles ? files[0] : null;
  const fileProgress = file && progresses ? progresses[file.name] : undefined;
  const isImage = file && file.type.startsWith("image/");

  return (
    <div className={cn("w-full space-y-4", className)} {...dropzoneProps}>
      {!hasFiles ? (
        <Dropzone
          onDrop={onDrop}
          accept={accept}
          maxSize={maxSize}
          maxFiles={maxFiles}
          multiple={multiple}
          disabled={isDisabled}
          onDragEnter={() => setIsDraggingOver(true)}
          onDragLeave={() => setIsDraggingOver(false)}
          onDropAccepted={() => setIsDraggingOver(false)}
          onDropRejected={() => setIsDraggingOver(false)}
        >
          {({ getRootProps, getInputProps }) => (
            <div
              {...getRootProps()}
              className={cn(
                "relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-200 ease-in-out",
                isDraggingOver
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-muted-foreground/25 hover:border-primary/40 hover:bg-accent/40",
                isDisabled && "pointer-events-none opacity-60",
                className
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-accent p-3">
                  <ImageIcon className={cn("h-6 w-6 text-muted-foreground")} />
                </div>
                <div className="space-y-2">
                  <p className="text-base font-medium">drop_or_select_file</p>
                  <p className="text-sm text-muted-foreground">
                    max_file_size , {formatBytes(maxSize)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2 focus:ring-2 ring-offset-2 ring-primary"
                >
                  select_file
                </Button>
              </div>
            </div>
          )}
        </Dropzone>
      ) : (
        <div className="relative overflow-hidden rounded-lg border bg-background">
          <div className="relative flex flex-col items-center p-4">
            {/* File Preview */}
            <div className="relative mb-4 aspect-square w-full max-w-[300px] overflow-hidden rounded-lg border bg-muted/40">
              {isImage && file && isFileWithPreview(file) ? (
                <Image
                  src={file.preview}
                  alt={file.name}
                  fill
                  className="object-contain transition-transform duration-200 hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FileIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}

              {/* Upload Progress Overlay */}
              {fileProgress !== undefined && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                  <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
                  <div className="w-4/5 max-w-[200px]">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300 ease-in-out"
                        style={{ width: `${fileProgress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-center text-sm font-medium">
                      {fileProgress < 100
                        ? "uploading_progress"
                        : "upload_complete"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* File Information */}
            <div className="w-full">
              {file && (
                <>
                  <p className="mb-1 text-center text-sm font-medium truncate">
                    {file.name}
                  </p>
                  <p className="text-center text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRemove}
                disabled={isUploading}
                className="flex items-center gap-1.5"
              >
                <Trash className="h-3.5 w-3.5" />
                <span>remove_image</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  return "preview" in file && typeof (file as any).preview === "string";
}
