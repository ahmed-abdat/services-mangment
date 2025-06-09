import { getService } from "@/features/dashboard/actions/services";
import { getServiceAccounts } from "@/features/dashboard/actions/service-accounts";
import NoServicesFound from "@/features/dashboard/components/NoServicesFound";
import AccountCard from "@/features/dashboard/components/AccountCard";
import { ServiceAccount } from "@/types/services/service-accounts";
import CardGrid from "@/components/card-grid";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  PageBreadcrumb,
  BreadcrumbItem,
} from "@/components/ui/page-breadcrumb";

interface PosteProps {
  params: {
    serviceId: string;
  };
}

export default async function ServiceName({ params }: PosteProps) {
  const { serviceId } = params;

  // Get service details first
  const serviceResult = await getService(serviceId);
  if (!serviceResult.success || !serviceResult.service) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-destructive">
            Service Not Found
          </h1>
          <p className="text-muted-foreground">
            The service you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  const service = serviceResult.service;

  // Build breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Services", href: "/services" },
    { label: service.name, isCurrentPage: true },
  ];

  // Get accounts after confirming service exists
  const { accounts, success } = await getServiceAccounts(serviceId);
  if (!success) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-destructive">
            Error Loading Accounts
          </h1>
          <p className="text-muted-foreground">
            There was an error loading the accounts for this service.
          </p>
        </div>
      </div>
    );
  }

  const hasAccounts = Array.isArray(accounts) && accounts.length > 0;

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <PageBreadcrumb items={breadcrumbItems} />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
          <p className="text-muted-foreground">
            Manage accounts for {service.name} service
          </p>
        </div>

        <Link href={`/services/${serviceId}/add-account`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Account
          </Button>
        </Link>
      </div>

      {/* Content */}
      {!hasAccounts ? (
        <NoServicesFound serviceId={serviceId} />
      ) : (
        <CardGrid>
          {accounts.map((account: ServiceAccount) => (
            <AccountCard
              key={account.id}
              account={account}
              serviceId={serviceId}
            />
          ))}
        </CardGrid>
      )}
    </div>
  );
}
