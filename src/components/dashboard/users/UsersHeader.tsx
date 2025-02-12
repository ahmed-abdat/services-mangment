"use client";

import React, { useEffect, useCallback, memo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { getServiceAccount } from "@/app/actions/accounts";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UsersHeaderProps {
  serviceId?: string;
  accountId?: string;
  accountName?: string;
}

function UsersHeader({
  serviceId,
  accountId,
  accountName: initialAccountName,
}: UsersHeaderProps) {
  const router = useRouter();
  const [accountName, setAccountName] = React.useState<string>(
    initialAccountName || ""
  );
  const uploadservesurl = `/services/${serviceId}/${accountId}/upload-user`;

  // Memoize the fetch function to prevent unnecessary recreations
  const fetchAccountName = useCallback(async () => {
    if (!serviceId || !accountId) return;

    try {
      const { account, success } = await getServiceAccount(
        serviceId,
        accountId
      );
      if (!success || !account) {
        toast.error("Failed to load account details");
        return;
      }
      setAccountName(account.name);
    } catch (error) {
      console.error("Error fetching account name:", error);
      toast.error("Error loading account details");
    }
  }, [serviceId, accountId]);

  // Check authentication
  useEffect(() => {
    const localeUser = localStorage?.getItem("user");
    if (!localeUser && !serviceId) {
      router.push("/");
    }
  }, [router, serviceId]);

  // Fetch account name if not provided
  useEffect(() => {
    if (!initialAccountName) {
      fetchAccountName();
    }
  }, [fetchAccountName, initialAccountName]);

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

// Memoize the component to prevent unnecessary re-renders
export default memo(UsersHeader);
