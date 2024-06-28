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
import { Skeleton } from "../ui/skeleton";
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

export function DeleteModal({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const serviceName = searchParams?.serviceName as string;
  const isModalOpen = searchParams?.openModal == "true" ? true : false;
  const accountId = searchParams?.accountId as string;

  const [service, setService] = useState<Service | null>(null);
  const [account, setAccount] = useState<ServiceAccount | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handelClose = () => {
    router.back();
    console.log("close");
  };

  const handelDeleteService = async () => {
    setLoading(true);
    if (!service?.name || !service.id) return;
    try {
      await deleteService(service?.id, service?.thumbnail);
      setTimeout(() => {
        toast.success("service deleted succesfully");
        router.refresh();
        setLoading(false);
        handelClose();
      }, 1500);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("error while deleting service");
    }
  };

  const handelDeleteAccount = async () => {
    console.log(account);
    
    if (!account?.name || !accountId) return;
    try {
      setLoading(true);
      const { success } = await deleteServiceAccount(serviceName, accountId);
      if (success) {
        setTimeout(() => {
          toast.success("account deleted succesfully");
          router.refresh();
          setLoading(false);
          handelClose();
        }, 2000);
        return;
      }else {
        toast.error("error while deleting account");
        setLoading(false);

      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("error while deleting account");
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
    <Dialog open={isModalOpen} onOpenChange={handelClose}>
      <DialogContent className="sm:max-w-[425px]" dir="ltr">
        <DialogHeader>
          <DialogTitle className="text-center"> delete service !</DialogTitle>
          <DialogDescription className="text-center">
            are you sure you want to delete this service ?
          </DialogDescription>
          {service ? (
            <div className="flex flex-col w-full h-full gap-y-4">
              <Image
                src={service?.thumbnail?.url || ""}
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
                src={account?.thumbnail?.url || ""}
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
        <DialogFooter>
          <Button variant="outline" onClick={handelClose}>
            cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            onClick={accountId ? handelDeleteAccount : handelDeleteService}
            disabled={loading || (!service?.name && !account?.name)}
            className="flex items-center gap-x-2"
          >
            delete
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
