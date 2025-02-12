"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { getServiceAccount } from "@/app/action";
import { Button } from "@/components/ui/button";

export default function ServiceHeader({
  serviceId,
  accountId,
}: {
  serviceId?: string;
  accountId?: string;
}) {
  const uploadservesurl = `/services/${serviceId}/${accountId}/upload-user`;
  const router = useRouter();
  const [accountName, setAccountName] = React.useState<string>("");

  // check if user is logged in
  useEffect(() => {
    const localeUser = localStorage?.getItem("user") ?? "";
    if (serviceId) return;
    if (localeUser) {
      router.push("/services");
      router.refresh();
      return;
    } else {
      router.push(`/`);
    }
  }, [router, serviceId]);

  useEffect(() => {
    if (!serviceId) {
      return;
    }
    const fetchAccountName = async () => {
      if (!accountId) return;

      const { account, success } = await getServiceAccount(
        serviceId,
        accountId
      );
      if (!success || !account) {
        return;
      }
      setAccountName(account.name);
    };
    fetchAccountName();
  }, [serviceId, accountId]);

  return (
    <div className="items-start justify-between py-4 border-b sm:flex mt-12">
      <div className="max-w-lg">
        <h1 className="text-zinc-800 text-2xl font-semibold">
          {accountName} Users
        </h1>
        <p className="text-zinc-600 mt-2 text-sm">
          Create and manage your users easily and quickly.
        </p>
      </div>
      <Link href={uploadservesurl} className="mt-4 md:mt-0">
        <Button
          variant="default"
          size="sm"
          className="w-full sm:w-auto gap-x-2"
        >
          <Plus className="h-4 w-4" />
          New User
        </Button>
      </Link>
    </div>
  );
}
