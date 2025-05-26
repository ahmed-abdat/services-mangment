import { getService } from "@/features/dashboard/actions/services";
import { getServiceAccounts } from "@/features/dashboard/actions/service-accounts";
import NoServicesFound from "@/features/dashboard/components/NoServicesFound";
import ServiceHeader from "@/features/dashboard/components/ServiceHeader";
import AccountCard from "@/features/dashboard/components/AccountCard";
import { ServiceAccount } from "@/types/services/service-accounts";
import { DeleteModal } from "@/features/dashboard";
import CardGrid from "@/components/card-grid";

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
        <div className="mt-6">
          <CardGrid>
            {accounts.map((account: ServiceAccount) => (
              <AccountCard
                key={account.id}
                account={account}
                serviceId={serviceId}
              />
            ))}
          </CardGrid>
        </div>
      )}
    </section>
  );
}
