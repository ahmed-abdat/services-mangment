import { Service } from '@/types/upload-serves'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Settings, Trash } from "lucide-react";
import {mainRoute} from '@/lib/mainroute'

export default function ServiceProfile({ service  } : { service: Service }) {
  const url = new URL(`${mainRoute}/services`);
  url.searchParams.set('serviceName', service?.id  ?? "0");
  url.searchParams.set("openModal", "true");
  
  const updateUrl = new URL(
    `${mainRoute}/services/upload-servers`
  );
  updateUrl.searchParams.set('serviceName', service?.id  ?? "0");

  
  return (
    <div key={service?.name} className="border rounded-lg shadow-md overflow-hidden">
            <Link href={`/services/${service?.id}`}>
                <Image
                  src={service?.thumbnail?.url ?? "/no-image.png"}
                  alt={service?.name ?? "no-image"}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
            </Link>
                <div className="p-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold">{service?.name}</h2>
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
