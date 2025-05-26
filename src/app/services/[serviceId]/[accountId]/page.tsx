import { getAccountUsers } from "@/app/action";
import { getServiceAccount } from "@/features/dashboard/actions/service-accounts";
import NoServicesFound from "@/features/dashboard/components/NoServicesFound";
import UsersHeader from "@/features/dashboard/components/users/UsersHeader";
import UsersTabel from "@/features/dashboard/components/users/UserTabel";
import { formatUserForClient } from "@/lib/utils/format";
import { TUserTable } from "@/types/services/user";
import { Suspense } from "react";
import { toast } from "sonner";

interface PageProps {
  params: {
    serviceId: string;
    accountId: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

// Loading component for the table
function LoadingTable() {
  return (
    <div className="w-full h-96 flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading users data...</div>
    </div>
  );
}

// Error component
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="w-full p-4 text-center">
      <p className="text-red-500">{message}</p>
    </div>
  );
}

export default async function ServiceAccountPage({
  params,
  searchParams,
}: PageProps) {
  const { serviceId, accountId } = params;

  try {
    // Fetch account details and users in parallel
    const [accountResponse, usersResponse] = await Promise.all([
      getServiceAccount(serviceId, accountId),
      getAccountUsers(serviceId, accountId),
    ]);

    if (!accountResponse.success || !accountResponse.account) {
      return <ErrorDisplay message="Error loading account details" />;
    }

    if (!usersResponse.success || !usersResponse.users) {
      return <ErrorDisplay message="Error loading users" />;
    }

    // Format users data for client components and ensure no null values
    const formattedUsers = usersResponse.users.map((user: TUserTable) =>
      formatUserForClient(user)
    );

    return (
      <section className="space-y-6">
        <Suspense fallback={<div>Loading header...</div>}>
          <UsersHeader
            serviceId={serviceId}
            accountId={accountId}
            accountName={accountResponse.account.name}
          />
        </Suspense>

        <Suspense fallback={<LoadingTable />}>
          {formattedUsers.length === 0 ? (
            <NoServicesFound serviceId={serviceId} />
          ) : (
            <UsersTabel users={formattedUsers} params={params} />
          )}
        </Suspense>
      </section>
    );
  } catch (error) {
    console.error("Error in ServiceAccountPage:", error);
    toast.error("An error occurred while loading the page");
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}
