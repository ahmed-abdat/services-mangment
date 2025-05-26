"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Service } from "@/types/upload-serves";
import {
  deleteService,
  getService,
} from "@/features/dashboard/actions/services";
import {
  deleteServiceAccount,
  getServiceAccount,
} from "@/features/dashboard/actions/service-accounts";
import { ServiceAccount } from "@/types/services/service-accounts";
import { createThumbnailFromUrl } from "@/lib/utils/thumbnail";

interface DeleteModalSearchParams {
  serviceName?: string;
  openModal?: string;
  accountId?: string;
}

export function DeleteModal({
  searchParams,
}: {
  searchParams: DeleteModalSearchParams;
}) {
  const serviceName = searchParams?.serviceName || "";
  const isModalOpen = searchParams?.openModal === "true";
  const accountId = searchParams?.accountId || "";

  const [service, setService] = useState<Service | null>(null);
  const [account, setAccount] = useState<ServiceAccount | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleDeleteService = async () => {
    // Validate service and required properties exist early
    if (!service?.name || !service.id) {
      toast.error("Service information is missing");
      return;
    }

    setLoading(true);

    try {
      // Extract thumbnail storage path properly using utility function
      const thumbnail = createThumbnailFromUrl(service.thumbnail_url);

      const result = await deleteService(service.id, thumbnail);

      if (result.success) {
        // Show success message with custom message if provided
        const successMessage =
          result.message || `Service "${service.name}" deleted successfully`;
        toast.success(successMessage);

        // Close modal and refresh data
        handleClose();
        router.refresh();
      } else {
        // Handle expected errors from the service
        const errorMessage = result.error || "Failed to delete service";
        toast.error(errorMessage);
      }
    } catch (error) {
      // Handle unexpected errors (network issues, etc.)
      console.error("Unexpected error deleting service:", error);
      const errorMessage =
        error instanceof Error
          ? `Unexpected error: ${error.message}`
          : "An unexpected error occurred while deleting the service";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Validate account and required properties exist early
    if (!account?.name || !accountId) {
      toast.error("Account information is missing");
      return;
    }

    setLoading(true);

    try {
      const result = await deleteServiceAccount(serviceName, accountId);

      if (result.success) {
        // Show success message
        const successMessage = `Account "${account.name}" deleted successfully`;
        toast.success(successMessage);

        // Close modal and refresh data
        handleClose();
        router.refresh();
      } else {
        // Handle expected errors from the service
        const errorMessage = result.error || "Failed to delete account";
        toast.error(errorMessage);
      }
    } catch (error) {
      // Handle unexpected errors (network issues, etc.)
      console.error("Unexpected error deleting account:", error);
      const errorMessage =
        error instanceof Error
          ? `Unexpected error: ${error.message}`
          : "An unexpected error occurred while deleting the account";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!serviceName) {
      return;
    }
    const fetchService = async () => {
      const { service, success } = await getService(serviceName);

      setService(service);
    };
    const fetchAccount = async () => {
      const { account, success } = await getServiceAccount(
        serviceName,
        accountId
      );
      if (!success || !account) return;
      setAccount(account);
    };
    // check if service or account
    if (accountId) {
      fetchAccount();
    } else {
      fetchService();
    }
  }, [serviceName, accountId]);

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" dir="ltr">
        <DialogHeader>
          <DialogTitle className="text-center">
            Delete {accountId ? "Account" : "Service"}!
          </DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to delete this{" "}
            {accountId ? "account" : "service"}?
          </DialogDescription>
          {service ? (
            <div className="flex flex-col w-full h-full gap-y-4">
              <Image
                src={service?.thumbnail_url || ""}
                alt={service?.name || "thumbnail"}
                width={200}
                height={200}
                className="object-cover rounded-md w-full h-40 sm:h-60 sm:w-full sm:rounded-md"
              />
              <h3 className="font-roboto font-semibold text-lg">
                {service?.name}
              </h3>
            </div>
          ) : account ? (
            <div className="flex flex-col w-full h-full gap-y-4">
              <Image
                src={account?.thumbnail_url || ""}
                alt={account?.name || "thumbnail"}
                width={200}
                height={200}
                className="object-cover rounded-md w-full h-40 sm:h-60 sm:w-full sm:rounded-md"
              />
              <h3 className="font-roboto font-semibold text-lg">
                {account?.name}
              </h3>
              <p>{account.details}</p>
            </div>
          ) : (
            <div className="flex flex-col w-full h-full gap-y-4">
              <Skeleton className="w-full h-40 sm:h-60" />
              <Skeleton className="w-full h-8" />
            </div>
          )}
        </DialogHeader>
        <DialogFooter className="flex gap-y-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            onClick={accountId ? handleDeleteAccount : handleDeleteService}
            disabled={loading || (!service?.name && !account?.name)}
            className="flex items-center gap-x-2"
          >
            {accountId ? "Delete Account" : "Delete Service"}
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
