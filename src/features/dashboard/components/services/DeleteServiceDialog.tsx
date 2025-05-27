"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { deleteService } from "@/features/dashboard/actions/services";
import { createThumbnailFromUrl } from "@/lib/utils/thumbnail";
import { Service } from "@/types/upload-serves";

interface DeleteServiceDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** The service to delete */
  service: Service;
  /** Called after successful deletion */
  onDeleted?: () => void;
}

/**
 * Enhanced Delete Service Dialog
 *
 * Follows UX best practices for destructive actions:
 * - Uses AlertDialog for proper accessibility
 * - Clear, specific messaging about consequences
 * - Descriptive button text instead of generic "Yes/No"
 * - Shows service name in confirmation
 * - Proper loading states
 * - Error handling with user-friendly messages
 */
export function DeleteServiceDialog({
  isOpen,
  onOpenChange,
  service,
  onDeleted,
}: DeleteServiceDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!service?.id) {
      toast.error("Service information is missing");
      return;
    }

    setIsDeleting(true);

    try {
      // Extract thumbnail storage path for cleanup
      const thumbnail = createThumbnailFromUrl(service.thumbnail_url);

      const result = await deleteService(service.id, thumbnail);

      if (result.success) {
        toast.success(
          result.message ||
            `Service "${service.name}" has been permanently deleted`
        );
        onOpenChange(false);
        onDeleted?.();
      } else {
        toast.error(result.error || "Failed to delete service");
      }
    } catch (error) {
      console.error("Unexpected error deleting service:", error);
      toast.error(
        error instanceof Error
          ? `Unexpected error: ${error.message}`
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[520px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Delete &ldquo;{service.name}&rdquo;?
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left pt-2">
            This action cannot be undone. This will permanently delete the
            service{" "}
            <span className="font-medium text-foreground">
              &ldquo;{service.name}&rdquo;
            </span>{" "}
            and remove all associated data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Service Preview */}
        <div className="py-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
            {service.thumbnail_url && (
              <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={service.thumbnail_url}
                  alt={service.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{service.name}</p>
              <p className="text-xs text-muted-foreground">
                Created{" "}
                {service.created_at
                  ? new Date(service.created_at).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete Service"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
