
import { getService, getServiceAccounts } from "@/app/action";
import { DeleteModal } from "@/components/dashboard/DeleteModel";
import NoServicesFound from "@/components/dashboard/NoServicesFound";
import ServiceHeader from "@/components/dashboard/ServiceHeader";
import { usePathname } from "next/navigation";
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


export default async function ServiceName({ params, searchParams }: PosteProps) {

  const { serviceId } = params;

  
  const { accounts, success } = await getServiceAccounts(serviceId);
  

  return (
    <section>
      <DeleteModal searchParams={searchParams} />
      <ServiceHeader serviceId={serviceId} />
      {accounts.length === 0 || !accounts ? (
        <NoServicesFound serviceId={serviceId} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-4">
          {accounts.map((account) => (
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
