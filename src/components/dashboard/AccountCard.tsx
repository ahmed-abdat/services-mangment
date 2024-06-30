import { Service } from "@/types/upload-serves";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Settings, Trash } from "lucide-react";
import { ServiceAccount } from "@/types/services/service-accounts";
import {mainRoute} from '@/lib/mainroute'

export default function ServiceProfile({
  account,
  serviceId,
}: {
  account: ServiceAccount;
  serviceId: string;
}) {
  const url = new URL(`${mainRoute}/services/${serviceId}`);
  url.searchParams.set("serviceName", serviceId ?? "0");
  url.searchParams.set("openModal", "true");
  url.searchParams.set("accountId", account?.id ?? "0");


  const updateUrl = new URL(`${mainRoute}/services/${serviceId}/upload-accounts`);
  updateUrl.searchParams.set("accountId", account?.id ?? "0");

  return (
    <div
      key={account?.id}
      className="border rounded-lg shadow-md overflow-hidden"
    >
      <Link href={`/services/${serviceId}/${account.id}`}>
        <Image
          src={account?.thumbnail?.url ?? "/no-image.png"}
          alt={account?.name ?? "no-image"}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-3 flex items-center justify-between flex-col gap-y-2">
        <div className="flex flex-col self-start">
        <h2 className="text-lg font-bold">{account?.name}</h2>
        <p>{account.details}</p>
        </div>
        <div className="flex items-center justify-center gap-x-4 self-end">
          <Link href={url.toString()} scroll={false}>
            <Trash className="cursor-pointer" />
          </Link>
          <Link href={updateUrl.toString()} scroll={false}>
            <Settings className="cursor-pointer" />
          </Link>
        </div>
      </div>
    </div>
  );
}
