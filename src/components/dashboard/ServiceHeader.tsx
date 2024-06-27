'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation';

export default function ServiceHeader({ serviceName } : {serviceName?: string }) {
    const uploadservesurl = serviceName ? `/services/${serviceName}/upload-accounts` : "/services/upload-servers";

    const router = useRouter();

     // check if user is logged in
  useEffect(() => {
    const localeUser = localStorage?.getItem("user") ?? "";
    if(serviceName) return ;
    if (localeUser) {
      router.push("/services");
      router.refresh();
      return;
    } else {
      router.push(`/`);
    }
  }, [router]);

  return (
    <div className="items-start justify-between py-4 border-b sm:flex mt-12">
        <div className="max-w-lg">
          <h1 className="text-zinc-800 text-2xl font-semibold">{serviceName || ''} Services</h1>
          <h1 className="text-zinc-600 mt-2 text-sm">
            Create and manage your {serviceName ? 'accounts' : 'Services'} easily and quickly.
          </h1>
        </div>
        <Link href={`${uploadservesurl}`}>
          <button
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 h-9 gap-x-2 w-full text-center rounded-lg px-4 mt-4 md:mt-0 sm:w-auto"
            type="button"
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="radix-:r43:"
            data-state="closed"
          >
            <Plus className="w-5 h-5" />
            New {serviceName ? 'Service Account' : 'Service'}
          </button>
        </Link>
      </div>
  )
}
