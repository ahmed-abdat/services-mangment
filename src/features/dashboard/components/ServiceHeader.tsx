"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getService } from "@/features/dashboard/actions/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ServiceHeaderProps {
  serviceId?: string;
  onSearch?: (searchTerm: string) => void;
}

export default function ServiceHeader({
  serviceId,
  onSearch,
}: ServiceHeaderProps) {
  const uploadServicesUrl = serviceId
    ? `/services/${serviceId}/add-account`
    : "/services/new-service";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serviceName, setServiceName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

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

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    // Update URL with search parameter
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/services${newUrl}`, { scroll: false });

    // Call the onSearch callback if provided
    if (onSearch) {
      onSearch(value.trim());
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/services${newUrl}`, { scroll: false });

    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {serviceName ? serviceName : "Services"}
          </h1>
          <p className="text-muted-foreground">
            {serviceName
              ? `Manage accounts for ${serviceName} service`
              : "Create and manage your services easily and quickly."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Link href={uploadServicesUrl}>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New {serviceName ? "Account" : "Service"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter Section */}
      {!serviceId && (
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-10 pr-10"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-muted"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchTerm && (
            <div className="text-sm text-muted-foreground">
              Searching for:{" "}
              <span className="font-medium">&quot;{searchTerm}&quot;</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
