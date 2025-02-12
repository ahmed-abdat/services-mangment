import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Header() {
  return (
    <header className="border-b top-0 bg-white xl:sticky">
      <nav className="pt-1.5 flex items-center justify-between flex-wrap text-sm sm:flex-nowrap custom-screen-xl">
        <div>
          <Link href="/services" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              width={50}
              height={50}
              alt="RIMcode logo"
              priority={true}
            />
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-gray-900">
                RIMcode
              </span>
              <span className="text-sm text-gray-600">Services Dashboard</span>
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
}
