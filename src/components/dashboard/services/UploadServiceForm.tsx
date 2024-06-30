"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Service, Thumbnail } from "@/types/upload-serves";
import React, { useEffect, useState } from "react";
import ServiceThumbnail from "@/components/dashboard/ServiceThumbnail";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addService, getService, updateService } from "@/app/action";
import { useRouter } from "next/navigation";

export default function UploadServiceForm({ name }: { name: string | string[] | undefined} ) {
    const [serviceName, setServiceName] = useState<string>('');
    const [thumbnail, setThumbnail] = useState<Thumbnail>(null);
    const [loading, setLoading] = useState(false);
  
  
  
    const router = useRouter();
  
    useEffect(() => {
      if (!name) {
        return;
      }
      const fetchService = async () => {
        const { service , success} = await getService(name as string);
        // console.log(service);
        
        if(!success || !service?.name) {
          toast.error("error while fetching service");
          return;
        }
        setThumbnail(service?.thumbnail);
        setServiceName(service?.name);
        // set them localy 
        localStorage.setItem("service", JSON.stringify(service));
        
        // setService(service);
      };
      fetchService();
  
    }, [name]);
  
    const handelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!serviceName) {
        toast.error("please enter service name");
        return;
      }
      if (!thumbnail) {
        toast.error("please select service thumbnail");
        return;
      }
      // get the local service
      const localService = localStorage.getItem("service");
      const localServiceData = localService ? JSON.parse(localService) : null;
      if(localServiceData?.name.trim() === serviceName.trim() && localServiceData?.thumbnail.url === thumbnail.url) {
        toast.error("service not changed");
        return;
      }
    
      setLoading(true);
      try {
        if(!serviceName) return
        if(name) {
          if(localServiceData.thumbnail.url === thumbnail.url) {
            await updateService(localServiceData.id, { name: serviceName });
          }else if (localServiceData.name === serviceName) {
            await updateService(localServiceData.id, {  thumbnail , oldThumbnail : localServiceData.thumbnail });
          }else {
            await updateService(localServiceData.id, { name: serviceName , thumbnail , oldThumbnail : localServiceData.thumbnail });
          }
          setTimeout(() => {
            setLoading(false);
            toast.success("service updated successfully");
            // clear the local service
            localStorage.removeItem("service");
            setThumbnail(null);
            router.push('/services')
          }, 1500); 
          return;
        }
       const {service , success} = await getService(name as string); 
       if(success && service?.id) {
        toast.error("service name already exist");
        setLoading(false);
        return;
       }
        await addService({ name: serviceName, thumbnail });
        setTimeout(() => {
          setLoading(false);
          toast.success("service created successfully");
          // clear the local service
          localStorage.removeItem("service");
          setThumbnail(null);
          router.push('/services')
        }, 1500);
      } catch (error) {
        setLoading(false);
        toast.error("error while creating new service");
        console.log(error);
      }
    }


  return (
    <form onSubmit={handelSubmit}>
    <div className="grid gap-4 py-4">
      <Label htmlFor="service-name" className="text-lg">Service Name</Label>
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
        <p className="text-sm text-red-500">please enter service name</p>
      )}
    </div>
    <ServiceThumbnail thumbnail={thumbnail} setThumbnail={setThumbnail} />

    <Button type="submit" className="w-full my-4 mx-auto md:max-w-full text-lg flex items-center gap-x-2" disabled={loading}>
      {name ? "update service" : "create new service"}
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    </Button>
  </form>
  )
}
