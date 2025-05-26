import { getService } from "@/features/dashboard/actions/services";
import { getServiceAccount } from "@/features/dashboard/actions/service-accounts";
import AccountForm from "@/features/dashboard/components/accounts/AccountForm";
import { ServiceAccount } from "@/types/services/service-accounts";

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

  // Fetch service name on the server
  const { service, success: serviceSuccess } = await getService(
    params.serviceId
  );
  const serviceName = serviceSuccess && service ? service.name : "";

  // Fetch account data if editing (server-side)
  let accountData: ServiceAccount | undefined = undefined;

  if (accountId && typeof accountId === "string" && accountId.length > 10) {
    try {
      const { account, success: accountSuccess } = await getServiceAccount(
        params.serviceId,
        accountId
      );
      if (accountSuccess && account) {
        accountData = account;
      }
    } catch (error) {
      console.error("Error fetching account details:", error);
      // Continue without account data for graceful degradation
    }
  }

  return (
    <AccountForm
      serviceId={params.serviceId}
      serviceName={serviceName}
      accountId={accountId}
      initialData={accountData}
    />
  );
}
