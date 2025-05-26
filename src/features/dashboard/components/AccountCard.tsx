import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Settings, Trash, Mail } from "lucide-react";
import { ServiceAccount } from "@/types/services/service-accounts";
import { mainRoute } from "@/lib/mainroute";

export default function AccountCard({
  account,
  serviceId,
}: {
  account: ServiceAccount;
  serviceId: string;
}) {
  // Create URLs for delete and update actions
  const getUrls = () => {
    const url = new URL(`${mainRoute}/services/${serviceId}`);
    url.searchParams.set("serviceName", serviceId);
    url.searchParams.set("openModal", "true");
    url.searchParams.set("accountId", account.id);

    const updateUrl = new URL(
      `${mainRoute}/services/${serviceId}/upload-accounts`
    );
    updateUrl.searchParams.set("accountId", account.id);

    return { url: url.toString(), updateUrl: updateUrl.toString() };
  };

  const { url, updateUrl } = getUrls();

  if (!account || !serviceId) {
    return <div className="border rounded-lg shadow-md p-4">Loading...</div>;
  }

  return (
    <div className="border rounded-lg shadow-md overflow-hidden">
      <Link href={`/services/${serviceId}/${account.id}`} className="block">
        <div className="relative aspect-video">
          <Image
            src={account?.thumbnail_url ?? "/no-image.png"}
            alt={account?.name ?? "no-image"}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <div className="p-4 flex flex-col gap-y-3">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold">{account?.name}</h2>
          {account.details && (
            <p className="text-gray-600 text-sm mt-1">{account.details}</p>
          )}
        </div>
        <div className="flex items-center gap-x-2 text-gray-600">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm break-all">{account.email}</p>
        </div>
        <div className="flex items-center justify-end gap-x-4 mt-2">
          <Link href={url} scroll={false}>
            <Trash className="w-5 h-5 cursor-pointer hover:text-red-500 transition-colors" />
          </Link>
          <Link href={updateUrl} scroll={false}>
            <Settings className="w-5 h-5 cursor-pointer hover:text-blue-500 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
