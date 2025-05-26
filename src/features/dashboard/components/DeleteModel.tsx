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
// import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Service } from "@/types/upload-serves";
import {
  deleteService,
  deleteServiceAccount,
  getService,
  getServiceAccount,
} from "@/app/action";
import { ServiceAccount } from "@/types/services/service-accounts";

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
  const serviceName = searchParams?.serviceName as string;
  const isModalOpen = searchParams?.openModal == "true" ? true : false;
  const accountId = searchParams?.accountId as string;

  const [service, setService] = useState<Service | null>(null);
  const [account, setAccount] = useState<ServiceAccount | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleDeleteService = async () => {
    setLoading(true);

    // Validate service and required properties exist
    if (!service?.name || !service.id) {
      toast.error("Service information is missing");
      setLoading(false);
      return;
    }

    try {
      // Convert string thumbnail_url to Thumbnail type
      const thumbnail = service.thumbnail_url
        ? {
            url: service.thumbnail_url,
            name: service.thumbnail_url.split("/").pop() || "",
          }
        : null;

      const result = await deleteService(service.id, thumbnail);

      if (result.success) {
        setTimeout(() => {
          toast.success(`Service "${service.name}" deleted successfully`);
          router.refresh();
          setLoading(false);
          handleClose();
        }, 1500);
      } else {
        throw new Error(result.error || "Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      setLoading(false);
      toast.error(
        error instanceof Error
          ? `Error deleting service: ${error.message}`
          : "An unexpected error occurred while deleting the service"
      );
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);

    // Validate account and required properties exist
    if (!account?.name || !accountId) {
      toast.error("Account information is missing");
      setLoading(false);
      return;
    }

    try {
      const { success } = await deleteServiceAccount(serviceName, accountId);

      if (success) {
        setTimeout(() => {
          toast.success(`Account "${account.name}" deleted successfully`);
          router.refresh();
          setLoading(false);
          handleClose();
        }, 2000);
        return;
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setLoading(false);
      toast.error(
        error instanceof Error
          ? `Error deleting account: ${error.message}`
          : "An unexpected error occurred while deleting the account"
      );
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
