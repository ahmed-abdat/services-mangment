'use client'


import { getService, getServiceAccounts } from '@/app/action';
import { DeleteModal } from '@/components/dashboard/DeleteModel';
import NoServicesFound from '@/components/dashboard/NoServicesFound';
import ServiceHeader from '@/components/dashboard/ServiceHeader';
import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation';
import AccountCard from '@/components/dashboard/AccountCard';
import { ServiceAccount } from '@/types/services/service-accounts';

interface PosteProps {
  params: {
    serviceId: string
  },
    searchParams: {
        [key: string]: string | string[] | undefined
    }
}

export default function ServiceName ( { params , searchParams }: PosteProps) {

    // const path = usePathname()

    const [accounts, setAccounts] = React.useState<ServiceAccount[] | []>([]);

    const [serviceName , setServiceName] = React.useState<string >('');
    

    const { serviceId } = params;



    

    useEffect(() => {
      const fetchAccounts = async () => {
        const { accounts , success} = await getServiceAccounts(serviceId);
        if(!success || !accounts) {
          return;
        }
        setAccounts(accounts);
      }
      
      const fetchServiceName = async () => {
        const { service , success} = await getService(serviceId);
        if(!success || !service) {
          return;
        }
        setServiceName(service.name);
      }
      fetchServiceName();
      fetchAccounts();
      
    }, [serviceId]);


      
    
  return (
<section>
      <DeleteModal searchParams={searchParams} />
      <ServiceHeader serviceId={serviceId} />
      {
        accounts.length === 0 || !accounts ? (
          <NoServicesFound serviceId={serviceId} />
        ) :  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-4">
        {accounts.map(account => (
          <AccountCard key={account.id} account={account} serviceId={serviceId} />
        ))}
      </div>
      }
    </section>
  )
}

