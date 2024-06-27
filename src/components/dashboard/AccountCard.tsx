import { Service } from '@/types/upload-serves'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Settings, Trash } from "lucide-react";
import { ServiceAccount } from '@/types/services/service-accounts';

export default function ServiceProfile({  account , serversName} : {  account: ServiceAccount , serversName: string}) {
  const mainUrl = 'http://localhost:3000';
  
  
  const url = new URL(`${mainUrl}/services/${serversName}`);
  url.searchParams.set('serviceName', account?.name  ?? "0");
  url.searchParams.set("openModal", "true");
  url.searchParams.set("accountId", account?.id ?? "0");

  
  const updateUrl = new URL(
    `${mainUrl}/services/${serversName}/upload-accounts`
  );
  updateUrl.searchParams.set('accountId', account?.name  ?? "0");
  

  return (
    <div key={account?.id} className="border rounded-lg shadow-md overflow-hidden">
            <Link href={`/services/${serversName}/${account.name}`}>
                <Image
                  src={account?.thumbnail?.url ?? "/no-image.png"}
                  alt={account?.name ?? "no-image"}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
            </Link>
                <div className="p-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold">{account?.name}</h2>
                  <div className="flex items-center justify-center gap-x-4">
                  <Link href={url.toString()} scroll={false}>
                  <Trash className="cursor-pointer"/>
                  </Link>
                  <Link href={updateUrl.toString()} scroll={false}>
                  <Settings className="cursor-pointer"/>
                  </Link>
                  </div>
                </div>
          </div>
  )
}
