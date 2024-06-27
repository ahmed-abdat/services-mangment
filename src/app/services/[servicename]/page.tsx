'use client'


import { getService, getServiceAccounts } from '@/app/action';
import { DeleteModal } from '@/components/dashboard/DeleteModel';
import NoServicesFound from '@/components/dashboard/NoServicesFound';
import ServiceHeader from '@/components/dashboard/ServiceHeader';
import React from 'react'
import ServiceCard from '@/components/dashboard/ServiceCard';
import { usePathname } from 'next/navigation';
import AccountCard from '@/components/dashboard/AccountCard';

interface PosteProps {
  params: {
    servicename: string
  },
    searchParams: {
        [key: string]: string | string[] | undefined
    }
}

export default async function ServiceName ( { params , searchParams }: PosteProps) {

    const path = usePathname()
    console.log(path.split('/').filter(Boolean));
    

    const { servicename } = params;



    const {accounts , success} = await getServiceAccounts(servicename);

    console.log(accounts);
    

    
    
  return (
<section>
      <DeleteModal searchParams={searchParams} />
      <ServiceHeader serviceName={servicename} />
      {
        accounts.length === 0 || !accounts ? (
          <NoServicesFound serviceName={servicename} />
        ) :  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-4">
        {accounts.map(account => (
          <AccountCard key={account.name} account={account} serversName={servicename} />
        ))}
      </div>
      }
    </section>
  )
}

