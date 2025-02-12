import { getAccountUsers } from "@/app/action";
import NoServicesFound from "@/components/dashboard/NoServicesFound";
import UsersHeader from "@/components/dashboard/users/UsersHeader";
import UsersTabel from "@/components/dashboard/users/UserTabel";
import { formatUserForClient } from "@/lib/utils/format";

interface PosteProps {
  params: {
    serviceId: string;
    accountId: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function ServiceName({
  params,
  searchParams,
}: PosteProps) {
  const { serviceId, accountId } = params;

  const { success, users } = await getAccountUsers(serviceId, accountId);
  if (!success) {
    return <div>Error loading users</div>;
  }

  // Format users data for client components and ensure no null values
  const formattedUsers = (users ?? []).map((user) => formatUserForClient(user));

  return (
    <section>
      {/* <DeleteModal searchParams={searchParams} /> */}
      <UsersHeader serviceId={serviceId} accountId={accountId} />
      {formattedUsers.length === 0 ? (
        <NoServicesFound serviceId={serviceId} />
      ) : (
        <UsersTabel users={formattedUsers} params={params} />
      )}
    </section>
  );
}
