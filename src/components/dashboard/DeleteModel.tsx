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
import { deleteService, getService } from "@/app/action";

export function DeleteModal({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // const collectionName = searchParams?.collectionName as string ;
  const serviceName =  searchParams?.serviceName;
  const isModalOpen = searchParams?.openModal == "true" ? true : false;
  // const flieresId = searchParams?.filiereId || null;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);

  
  const router = useRouter();

  const handelClose = () => {
    router.back();
    console.log("close");
  };
  // const handelDeletePoste = () => {
  //   setLoading(true);
  //   try {
  //     if (collectionName === "student-space") {
  //       delteStudentPosteImages(poste?.id, poste ?.images ?? [], poste ?.thumbnail ?? null);
  //     } else if (collectionName === "postes") {
  //       deltePosteImages(poste?.id, poste ?.images ?? [], poste ?.thumbnail ?? null);
  //     } else {
  //       deleteFlitersTabel(collectionName, posteId as string, flieresId as string);
  //     }
  //     router.refresh();
  //     setTimeout(() => {
  //       toast.success("تم حذف المنشور بنجاح");
  //       setLoading(false);
  //       handelClose();
  //     }, 1500);
  //   } catch (error) {
  //     toast.error("لم يتم حذف المنشور بنجاح");
  //     setLoading(false);
  //     console.log(error);
  //   }
  // };

  const handelDeleteService = async () => {
    setLoading(true);
    if(!service?.name || !service.id ) return 
    try {
      await deleteService(service?.name , service?.thumbnail);
      setTimeout(() => {
        toast.success('service deleted succesfully');
        router.refresh();
        setLoading(false);
        handelClose();
      }, 1500);
    }catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (!serviceName) {
      return;
    }
    const fetchService = async () => {
      const { service , success} = await getService(serviceName as string);
      console.log(service);
      
      setService(service);
    };
    fetchService();

  }, [serviceName]);

  


  

  return (
    <Dialog open={isModalOpen} onOpenChange={handelClose}>
      <DialogContent className="sm:max-w-[425px]" dir="ltr">
        <DialogHeader>
          <DialogTitle className="text-center" > delete service !</DialogTitle>
          <DialogDescription className="text-center">
            are you sure you want to delete this service ?
          </DialogDescription>
          {service ? (
            <div className="flex flex-col w-full h-full gap-y-4">
              <Image
                src={service?.thumbnail?.url || ''}
                alt={service?.name || "thumbnail"}
                width={200}
                height={200}
                className="object-cover rounded-md w-full h-40 sm:h-60 sm:w-full sm:rounded-md"
              />
              <h3 className="font-roboto font-semibold text-lg">
                {service?.name}
              </h3>
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
            onClick={handelDeleteService}
            disabled={loading || (!service?.name)}
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
