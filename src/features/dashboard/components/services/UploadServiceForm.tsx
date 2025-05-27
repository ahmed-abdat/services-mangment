"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  addService,
  getService,
  updateService,
} from "@/features/dashboard/actions/services";
import { uploadThumbnail } from "@/features/dashboard/actions/upload";
import { FileUploader } from "@/components/ui/file-uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import {
  extractThumbnailStoragePath,
  validateThumbnailFile,
} from "@/lib/utils/thumbnail";

export default function UploadServiceForm({
  name,
}: {
  name: string | string[] | undefined;
}) {
  const [serviceName, setServiceName] = useState<string>("");
  const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<
    string | null
  >(null);
  const [existingThumbnailName, setExistingThumbnailName] = useState<
    string | null
  >(null);
  const [thumbnailError, setThumbnailError] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!name) {
      return;
    }
    const fetchService = async () => {
      const { service, success } = await getService(name as string);

      if (!success || !service?.name) {
        toast.error("Error while fetching service");
        return;
      }

      // Store thumbnail information if it exists
      if (service.thumbnail_url) {
        setExistingThumbnailUrl(service.thumbnail_url);
        const storagePath = extractThumbnailStoragePath(service.thumbnail_url);
        setExistingThumbnailName(storagePath || "");
      }

      setServiceName(service?.name);

      // Store in localStorage with the correct format
      localStorage.setItem(
        "service",
        JSON.stringify({
          ...service,
          thumbnail: service.thumbnail_url
            ? {
                url: service.thumbnail_url,
                name: extractThumbnailStoragePath(service.thumbnail_url) || "",
              }
            : null,
        })
      );
    };
    fetchService();
  }, [name]);

  // This function now only handles file preview and validation
  // It doesn't actually upload the file to the server
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

  // Start upload progress simulation
  const startProgressSimulation = (fileName: string) => {
    const timer = setInterval(() => {
      setUploadProgress((prev) => {
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
  };

  // Complete upload progress
  const completeProgress = (fileName: string) => {
    setUploadProgress((prev) => ({
      ...prev,
      [fileName]: 100,
    }));
  };

  // Helper function to upload thumbnail using FormData
  const uploadThumbnailWithFormData = async (
    serviceId: string,
    file: File,
    oldThumbnailName?: string | null
  ) => {
    const formData = new FormData();
    formData.append("serviceId", serviceId);
    formData.append("file", file);
    if (oldThumbnailName) {
      formData.append("oldThumbnailName", oldThumbnailName);
    }

    return await uploadThumbnail(formData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!serviceName) {
      toast.error("Please enter service name");
      return;
    }

    // Check if we're creating a new service (not editing)
    // We're editing if we have both a name parameter AND localStorage data for the service
    const localService = localStorage.getItem("service");
    const localServiceData = localService ? JSON.parse(localService) : null;
    const isEditing = name && localServiceData && localServiceData.id;

    // For new services, require thumbnail
    if (!isEditing && thumbnailFiles.length === 0) {
      toast.error("Please upload a service thumbnail");
      return;
    }

    setLoading(true);
    try {
      // Check if we're updating or creating
      if (isEditing) {
        // UPDATING EXISTING SERVICE
        // Check if anything changed
        if (
          localServiceData?.name.trim() === serviceName.trim() &&
          thumbnailFiles.length === 0
        ) {
          toast.error("No changes detected");
          setLoading(false);
          return;
        }

        // Handle name update
        if (localServiceData.name.trim() !== serviceName.trim()) {
          const updateResult = await updateService(localServiceData.id, {
            name: serviceName.trim(),
          });

          if (!updateResult.success) {
            throw new Error(
              updateResult.error || "Failed to update service name"
            );
          }
        }

        // Handle thumbnail update if there's a new file
        if (thumbnailFiles.length > 0) {
          const file = thumbnailFiles[0];
          const fileName = file.name;

          // Start progress simulation
          const timer = startProgressSimulation(fileName);

          try {
            // Upload the thumbnail using FormData
            const result = await uploadThumbnailWithFormData(
              localServiceData.id,
              file,
              localServiceData.thumbnail?.name
            );

            // Complete progress
            clearInterval(timer);
            completeProgress(fileName);

            if (!result.success) {
              throw new Error(result.error || "Failed to upload thumbnail");
            }

            // Show success message if provided
            if (result.message) {
              toast.success(result.message);
            }
          } catch (error) {
            clearInterval(timer);
            throw error; // Re-throw to be caught by outer try-catch
          }
        }

        toast.success("Service updated successfully");
        localStorage.removeItem("service");
        router.push("/services");
      } else {
        // CREATING NEW SERVICE
        // Create a plain object for the service that matches ServiceCreate interface
        const serviceData: { name: string; thumbnail_url?: string | null } = {
          name: serviceName.trim(),
          thumbnail_url: null, // Initialize with null since we'll update it after upload if needed
        };

        // First create the service with minimal data
        const result = await addService(serviceData);

        if (!result.success) {
          throw new Error(result.error || "Failed to create service");
        }

        if (!result.serviceId) {
          throw new Error("Service was created but no ID was returned");
        }

        // Then upload the thumbnail (required for new services)
        if (thumbnailFiles.length > 0) {
          const file = thumbnailFiles[0];
          const fileName = file.name;

          // Start progress simulation
          const timer = startProgressSimulation(fileName);

          try {
            // Upload the thumbnail using FormData
            const uploadResult = await uploadThumbnailWithFormData(
              result.serviceId,
              file
            );

            // Complete progress
            clearInterval(timer);
            completeProgress(fileName);

            if (!uploadResult.success) {
              throw new Error(
                uploadResult.error || "Failed to upload thumbnail"
              );
            }

            // Show success message if provided
            if (uploadResult.message) {
              toast.success(uploadResult.message);
            }
          } catch (error) {
            clearInterval(timer);
            throw error; // Re-throw to be caught by outer try-catch
          }
        }

        toast.success("Service created successfully");
        localStorage.removeItem("service");
        router.push("/services");
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <Label htmlFor="service-name" className="text-lg">
          Service Name
        </Label>
        <Input
          type="text"
          id="service-name"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          className={cn({
            "focus-visible:ring-red-500": !serviceName,
          })}
          placeholder="chatgpt"
        />

        {!serviceName && (
          <p className="text-sm text-red-500">Please enter service name</p>
        )}
      </div>

      <Card
        className={cn("w-full mb-6", {
          "border-red-500": !name && thumbnailFiles.length === 0,
        })}
      >
        <CardHeader className="px-4 pt-3 pb-2">
          <CardTitle className="font-semibold text-lg">
            Service Thumbnail <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {/* Show existing thumbnail if available */}
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
              {name ? "Update Service" : "Create New Service"}&quot; to upload.
            </p>
          )}

          {/* Show validation message for new services without thumbnail */}
          {!name && thumbnailFiles.length === 0 && (
            <p className="text-sm text-red-500 mt-2">
              Please upload a service thumbnail (required)
            </p>
          )}
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full my-4 mx-auto md:max-w-full text-lg flex items-center gap-x-2"
        disabled={
          loading || !serviceName || (!name && thumbnailFiles.length === 0)
        }
      >
        {name ? "Update Service" : "Create New Service"}
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      </Button>
    </form>
  );
}
