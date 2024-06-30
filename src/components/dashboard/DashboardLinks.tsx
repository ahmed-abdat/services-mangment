'use client'

import React, { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getService, getServiceAccount } from "@/app/action"; // Import your fetching functions

type TBreadCrumbProps = {
  separator: ReactNode;
  containerClasses?: string;
  listClasses?: string;
  activeClasses?: string;
  capitalizeLinks?: boolean;
  
};

const NextBreadcrumb = ({
  separator,
  containerClasses,
  listClasses,
  activeClasses,
  capitalizeLinks,
}: TBreadCrumbProps) => {
  const paths = usePathname();
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [accountName, setAccountName] = useState<string | null>(null);
  const pathNames = paths.split('/').filter(Boolean);

  useEffect(() => {
    const fetchNames = async () => {
      if (pathNames[1] && pathNames[2]) {
        const serviceId = pathNames[1];
        const accountId = pathNames[2];
        
        const serviceResult = await getService(serviceId);
        const accountResult = await getServiceAccount(serviceId, accountId);
        
        if (serviceResult.success && serviceResult.service) {
          setServiceName(serviceResult.service.name || null);
        }
        
        if (accountResult.success && accountResult.account) {
          setAccountName(accountResult.account.name || null);
        }
      }
    };

    fetchNames();
  }, [pathNames]);

  const getDisplayName = (path: string, index: number) => {
    if (index === 1 && serviceName) return serviceName;
    if (index === 2 && accountName) return accountName;
    return capitalizeLinks
      ? path[0].toUpperCase() + path.slice(1)
      : path;
  };

  return (
    <div className='xl:sticky xl:top-16 bg-white p-4'>
      <ul className={containerClasses}>
        {pathNames.length > 0 && separator}
        {pathNames.map((link, index) => {
          let href = `/${pathNames.slice(0, index + 1).join('/')}`;
          let itemClasses =
            paths.replace('%20', ' ') === href ? `${listClasses} ${activeClasses}` : listClasses;
          let itemLink = getDisplayName(link, index);
          return (
            <React.Fragment key={index}>
              <li className={itemClasses}>
                <Link href={href}>{itemLink}</Link>
              </li>
              {pathNames.length !== index + 1 && separator}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default NextBreadcrumb;
