"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { getService } from "@/features/dashboard/actions/services";
import { Button } from "@/components/ui/button";

export default function ServiceHeader({ serviceId }: { serviceId?: string }) {
  const uploadServicesUrl = serviceId
    ? `/services/${serviceId}/upload-accounts`
    : "/services/upload-servers";
  const router = useRouter();
  const [serviceName, setServiceName] = React.useState<string>("");

  useEffect(() => {
    if (!serviceId) {
      return;
    }
    const fetchServiceName = async () => {
      try {
        const { service, success } = await getService(serviceId);
        if (!success || !service) {
          console.error("Failed to fetch service or service not found");
          return;
        }
        setServiceName(service.name);
      } catch (error) {
        console.error("Error fetching service name:", error);
        // Optionally set a fallback service name or show error state
      }
    };
    fetchServiceName();
  }, [serviceId]);

  return (
    <div className="items-start justify-between py-4 border-b sm:flex mt-12">
      <div className="max-w-lg">
        <h1 className="text-zinc-800 text-2xl font-semibold">
          {serviceName ? `${serviceName} Accounts` : "Services"}
        </h1>
        <p className="text-zinc-600 mt-2 text-sm">
          Create and manage your {serviceName ? "accounts" : "Services"} easily
          and quickly.
        </p>
      </div>
      <Link href={uploadServicesUrl} className="mt-4 md:mt-0">
        <Button
          variant="default"
          size="sm"
          className="w-full sm:w-auto gap-x-2"
        >
          <Plus className="h-4 w-4" />
          New {serviceName ? "Account" : "Service"}
        </Button>
      </Link>
    </div>
  );
}
