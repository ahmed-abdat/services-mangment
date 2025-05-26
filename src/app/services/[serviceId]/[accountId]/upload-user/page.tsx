import { getService } from "@/features/dashboard/actions/services";
import { getServiceAccount } from "@/features/dashboard/actions/service-accounts";
import { getAccountUser } from "@/features/dashboard/actions/service-users";
import UserForm from "@/features/dashboard/components/users/UserForm";
import { TUserTable } from "@/types/services/user";

/**
 * Upload User Page
 * Server component that fetches required data and renders the UserForm component
 */

interface UploadUserPageProps {
  params: { serviceId: string; accountId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function UploadUserPage({
  params,
  searchParams,
}: UploadUserPageProps) {
  const { serviceId, accountId } = params;
  const userId = searchParams?.userId as string;

  // Fetch service name on the server
  const { service, success: serviceSuccess } = await getService(serviceId);
  const serviceName = serviceSuccess && service ? service.name : "";

  // Fetch account name on the server
  const { account, success: accountSuccess } = await getServiceAccount(
    serviceId,
    accountId
  );
  const accountName = accountSuccess && account ? account.name : "";

  // Fetch user data if editing (server-side)
  let userData: TUserTable | null = null;

  if (userId && typeof userId === "string" && userId.length > 10) {
    try {
      const { user, success: userSuccess } = await getAccountUser(
        serviceId,
        accountId,
        userId
      );
      if (userSuccess && user) {
        userData = user;
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      // Continue without user data for graceful degradation
    }
  }

  return (
    <UserForm
      serviceId={serviceId}
      accountId={accountId}
      userId={userId}
      serviceName={serviceName}
      accountName={accountName}
      initialData={userData}
    />
  );
}
