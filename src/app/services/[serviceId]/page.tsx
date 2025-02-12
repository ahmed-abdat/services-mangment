import { getService } from "@/app/actions/services";
import { getServiceAccounts } from "@/app/actions/accounts";
import { DeleteModal } from "@/components/dashboard/DeleteModel";
import NoServicesFound from "@/components/dashboard/NoServicesFound";
import ServiceHeader from "@/components/dashboard/ServiceHeader";
import AccountCard from "@/components/dashboard/AccountCard";
import { ServiceAccount } from "@/types/services/service-accounts";

interface PosteProps {
  params: {
    serviceId: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function ServiceName({
  params,
  searchParams,
}: PosteProps) {
  const { serviceId } = params;

  // Get service details first
  const serviceResult = await getService(serviceId);
  if (!serviceResult.success || !serviceResult.service) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-lg text-gray-600">Service not found</p>
      </div>
    );
  }

  // Get accounts after confirming service exists
  const { accounts, success } = await getServiceAccounts(serviceId);
  if (!success) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-lg text-gray-600">Error loading accounts</p>
      </div>
    );
  }

  const hasAccounts = Array.isArray(accounts) && accounts.length > 0;

  return (
    <section>
      <DeleteModal searchParams={searchParams} />
      <ServiceHeader serviceId={serviceId} />
      {!hasAccounts ? (
        <NoServicesFound serviceId={serviceId} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          {accounts.map((account: ServiceAccount) => (
            <AccountCard
              key={account.id}
              account={account}
              serviceId={serviceId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
