"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getService, getServiceAccount } from "@/app/action";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function DashboardLinks() {
  const paths = usePathname();
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [accountName, setAccountName] = useState<string | null>(null);
  const pathNames = paths.split("/").filter(Boolean);

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
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="xl:sticky xl:top-16 bg-white p-4">
      <Breadcrumb>
        <BreadcrumbList>
          {pathNames.map((path, index) => {
            const href = `/${pathNames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathNames.length - 1;
            const displayName = getDisplayName(path, index);

            return (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{displayName}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink>
                      <Link href={href}>{displayName}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
