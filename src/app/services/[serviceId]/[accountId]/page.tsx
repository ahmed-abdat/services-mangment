"use client";

import { getAccountUsers, getService, getServiceAccounts } from "@/app/action";
import { DeleteModal } from "@/components/dashboard/DeleteModel";
import NoServicesFound from "@/components/dashboard/NoServicesFound";
import ServiceHeader from "@/components/dashboard/ServiceHeader";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import AccountCard from "@/components/dashboard/AccountCard";
import { ServiceAccount } from "@/types/services/service-accounts";
import UsersHeader from "@/components/dashboard/users/UsersHeader";
import UsersTabel from "@/components/dashboard/users/UserTabel";
import { TUserData, TUserTabel } from "@/types/services/user";


interface PosteProps {
  params: {
    serviceId: string;
    accountId: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default function ServiceName({ params, searchParams }: PosteProps) {
  const [accounts, setAccounts] = React.useState<ServiceAccount[] | []>([]);
  const [users, setUsers] = React.useState<TUserTabel[] | []>([]);

  const { serviceId, accountId } = params;


  useEffect(() => {
    const fetchAccounts = async () => {
      const { accounts, success } = await getServiceAccounts(serviceId);
      if (!success || !accounts) {
        return;
      }
      setAccounts(accounts);
    };
    const getAllUsers = async () => {
      if(!serviceId || !accountId) return;
      const {success , users} = await getAccountUsers(serviceId , accountId);
      if(!success || !users) {
        return;
      }
      console.log(users);
      
      setUsers(users);
      
    }
    getAllUsers();
    fetchAccounts();
  }, [serviceId]);

  return (
    <section>
      {/* <DeleteModal searchParams={searchParams} /> */}
      <UsersHeader serviceId={serviceId} accountId={accountId}/>
      {accounts.length === 0 || !accounts ? (
        <NoServicesFound serviceId={serviceId} />
      ) : (
       <UsersTabel  users={users} params={params}/>
      )}
    </section>
  );
}
