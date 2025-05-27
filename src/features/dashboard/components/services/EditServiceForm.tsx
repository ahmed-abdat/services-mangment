"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  getService,
  updateService,
} from "@/features/dashboard/actions/services";
import ServiceFormFields from "./shared/ServiceFormFields";
import ThumbnailUploader from "./shared/ThumbnailUploader";
import {
  UploadProgressManager,
  uploadThumbnailWithFormData,
} from "./shared/serviceFormUtils";
import { extractThumbnailStoragePath } from "@/lib/utils/thumbnail";

interface EditServiceFormProps {
  serviceId: string;
}

interface ServiceData {
  id: string;
  name: string;
  thumbnail_url?: string | null;
  thumbnail?: {
    url: string;
    name: string;
  } | null;
}

export default function EditServiceForm({ serviceId }: EditServiceFormProps) {
  const [serviceName, setServiceName] = useState<string>("");
  const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [showValidation, setShowValidation] = useState(false);
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<
    string | null
  >(null);
  const [existingThumbnailName, setExistingThumbnailName] = useState<
    string | null
  >(null);

  const router = useRouter();
  const progressManager = new UploadProgressManager(setUploadProgress);

  // Load service data on component mount
  useEffect(() => {
    const fetchService = async () => {
      const { service, success } = await getService(serviceId);

      if (!success || !service?.name) {
        toast.error("Error while fetching service");
        router.push("/services");
        return;
      }

      // Set service data
      setServiceName(service.name);

      // Store thumbnail information if it exists
      if (service.thumbnail_url) {
        setExistingThumbnailUrl(service.thumbnail_url);
        const storagePath = extractThumbnailStoragePath(service.thumbnail_url);
        setExistingThumbnailName(storagePath || "");
      }

      // Create service data object
      const data: ServiceData = {
        ...service,
        thumbnail: service.thumbnail_url
          ? {
              url: service.thumbnail_url,
              name: extractThumbnailStoragePath(service.thumbnail_url) || "",
            }
          : null,
      };

      setServiceData(data);
    };

    fetchService();
  }, [serviceId, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!serviceData) {
      toast.error("Service data not loaded");
      return;
    }

    // Show validation messages
    setShowValidation(true);

    // Validate service name
    if (!serviceName.trim()) {
      toast.error("Please enter service name");
      return;
    }

    // Check if anything changed
    const nameChanged = serviceData.name.trim() !== serviceName.trim();
    const thumbnailChanged = thumbnailFiles.length > 0;

    if (!nameChanged && !thumbnailChanged) {
      toast.error("No changes detected");
      return;
    }

    setLoading(true);
    try {
      // Handle name update
      if (nameChanged) {
        const updateResult = await updateService(serviceData.id, {
          name: serviceName.trim(),
        });

        if (!updateResult.success) {
          throw new Error(
            updateResult.error || "Failed to update service name"
          );
        }
      }

      // Handle thumbnail update if there's a new file
      if (thumbnailChanged) {
        const file = thumbnailFiles[0];
        const fileName = file.name;

        // Start progress simulation
        const timer = progressManager.startProgressSimulation(fileName);

        try {
          // Upload the thumbnail using FormData
          const result = await uploadThumbnailWithFormData(
            serviceData.id,
            file,
            serviceData.thumbnail?.name
          );

          // Complete progress
          clearInterval(timer);
          progressManager.completeProgress(fileName);

          if (!result.success) {
            throw new Error(result.error || "Failed to upload thumbnail");
          }

          // Show success message if provided
          if (result.message) {
            toast.success(result.message);
          }
        } catch (error) {
          clearInterval(timer);
          throw error;
        }
      }

      toast.success("Service updated successfully");
      router.push("/services");
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching service data
  if (!serviceData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading service data...</span>
      </div>
    );
  }

  // Check if form has changes
  const hasChanges =
    serviceData.name.trim() !== serviceName.trim() || thumbnailFiles.length > 0;

  return (
    <form onSubmit={handleSubmit}>
      <ServiceFormFields
        serviceName={serviceName}
        setServiceName={setServiceName}
        hasError={showValidation && !serviceName.trim()}
        showValidation={showValidation}
      />

      <ThumbnailUploader
        thumbnailFiles={thumbnailFiles}
        setThumbnailFiles={setThumbnailFiles}
        uploadProgress={uploadProgress}
        existingThumbnailUrl={existingThumbnailUrl}
        isRequired={false}
        showValidation={showValidation}
        mode="edit"
      />

      <Button
        type="submit"
        className="w-full my-4 mx-auto md:max-w-full text-lg flex items-center gap-x-2"
        disabled={loading || !serviceName.trim() || !hasChanges}
      >
        Update Service
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      </Button>
    </form>
  );
}
