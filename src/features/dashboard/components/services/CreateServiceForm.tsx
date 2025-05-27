"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { addService } from "@/features/dashboard/actions/services";
import ServiceFormFields from "./shared/ServiceFormFields";
import ThumbnailUploader from "./shared/ThumbnailUploader";
import {
  UploadProgressManager,
  uploadThumbnailWithFormData,
} from "./shared/serviceFormUtils";

export default function CreateServiceForm() {
  const [serviceName, setServiceName] = useState<string>("");
  const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [showValidation, setShowValidation] = useState(false);

  const router = useRouter();
  const progressManager = new UploadProgressManager(setUploadProgress);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Show validation messages
    setShowValidation(true);

    // Validate required fields
    if (!serviceName.trim()) {
      toast.error("Please enter service name");
      return;
    }

    if (thumbnailFiles.length === 0) {
      toast.error("Please upload a service thumbnail");
      return;
    }

    setLoading(true);
    try {
      // Create the service with minimal data
      const serviceData = {
        name: serviceName.trim(),
        thumbnail_url: null, // Will be updated after upload
      };

      const result = await addService(serviceData);

      if (!result.success) {
        throw new Error(result.error || "Failed to create service");
      }

      if (!result.serviceId) {
        throw new Error("Service was created but no ID was returned");
      }

      // Upload the thumbnail
      const file = thumbnailFiles[0];
      const fileName = file.name;

      // Start progress simulation
      const timer = progressManager.startProgressSimulation(fileName);

      try {
        // Upload the thumbnail using FormData
        const uploadResult = await uploadThumbnailWithFormData(
          result.serviceId,
          file
        );

        // Complete progress
        clearInterval(timer);
        progressManager.completeProgress(fileName);

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Failed to upload thumbnail");
        }

        // Show success message if provided
        if (uploadResult.message) {
          toast.success(uploadResult.message);
        }
      } catch (error) {
        clearInterval(timer);
        throw error;
      }

      toast.success("Service created successfully");
      router.push("/services");
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid = serviceName.trim() && thumbnailFiles.length > 0;

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
        isRequired={true}
        showValidation={showValidation}
        mode="create"
      />

      <Button
        type="submit"
        className="w-full my-4 mx-auto md:max-w-full text-lg flex items-center gap-x-2"
        disabled={loading || !isFormValid}
      >
        Create New Service
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      </Button>
    </form>
  );
}
