import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, UsersRound } from "lucide-react";

export default function NoServicesFound({
  serviceId,
  accountId,
}: {
  serviceId?: string;
  accountId?: string;
}) {
  const uploadservesurl =
    serviceId && accountId
      ? `/services/${serviceId}/${accountId}/upload-user`
      : serviceId
      ? `/services/${serviceId}/upload-accounts`
      : "/services/upload-servers";
  return (
    <>
      <div className="mt-8">
        <div className="py-20 text-center flex flex-col items-center ">
          <div className="relative w-[200px] h-[200px]">
            <Image
              src="/no-services.png"
              alt="No Services Found"
              fill
              priority
              className="object-contain"
              sizes="200px"
            />
          </div>
          <p className="text-sm text-zinc-600 mt-2">
            you have not created any{" "}
            {serviceId && accountId
              ? "users"
              : serviceId
              ? "accounts"
              : "services"}{" "}
            yet.
          </p>
          <Link
            href={`${uploadservesurl}`}
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50 h-9 rounded-md px-3 gap-x-1 group"
          >
            Create New{" "}
            {serviceId && accountId
              ? "User"
              : serviceId
              ? "Account"
              : "Service"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
