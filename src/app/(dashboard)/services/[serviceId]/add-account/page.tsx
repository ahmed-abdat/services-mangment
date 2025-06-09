import { getService } from "@/features/dashboard/actions/services";
import { getServiceAccount } from "@/features/dashboard/actions/service-accounts";
import AccountForm from "@/features/dashboard/components/accounts/AccountForm";
import { ServiceAccount } from "@/types/services/service-accounts";
import { notFound } from "next/navigation";

import {
  PageBreadcrumb,
  BreadcrumbItem,
} from "@/components/ui/page-breadcrumb";

/**
 * Upload Accounts Page
 * Server component that fetches required data and renders the AccountForm component
 */

interface UploadAccountsPageProps {
  params: { serviceId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function UploadAccountsPage({
  params,
  searchParams,
}: UploadAccountsPageProps) {
  const accountId = searchParams?.accountId as string;

  // Fetch service and handle not found case explicitly
  const { service, success: serviceSuccess } = await getService(
    params.serviceId
  );

  // If service is not found, redirect to 404 page
  if (!serviceSuccess || !service) {
    notFound();
  }

  const serviceName = service.name;

  // Fetch account data if editing (server-side)
  // Let Supabase handle UUID validation naturally
  let accountData: ServiceAccount | undefined = undefined;
  let accountFetchError: string | null = null;

  if (accountId && typeof accountId === "string") {
    try {
      const { account, success: accountSuccess } = await getServiceAccount(
        params.serviceId,
        accountId
      );
      if (accountSuccess && account) {
        accountData = account;
      } else {
        accountFetchError = "Account not found or access denied";
      }
    } catch (error) {
      console.error("Error fetching account details:", error);
      accountFetchError =
        error instanceof Error
          ? `Failed to load account: ${error.message}`
          : "Failed to load account details. Please try again.";
    }
  }

  // Build breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Services", href: "/services" },
    { label: serviceName, href: `/services/${params.serviceId}` },
    {
      label: accountId ? "Edit Account" : "Add Account",
      isCurrentPage: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <PageBreadcrumb items={breadcrumbItems} sticky />

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {accountId ? "Edit Account" : "Add New Account"}
        </h1>
        <p className="text-muted-foreground">
          {accountId
            ? "Update account information and settings."
            : `Add a new account to ${serviceName} service.`}
        </p>
      </div>

      <AccountForm
        serviceId={params.serviceId}
        serviceName={serviceName}
        accountId={accountId}
        initialData={accountData}
        fetchError={accountFetchError}
      />
    </div>
  );
}
