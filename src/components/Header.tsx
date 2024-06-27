import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Header() {
  return (
    <header className="border-b top-0 bg-white xl:sticky">
      <nav className="pt-1.5 flex items-center justify-between flex-wrap text-sm sm:flex-nowrap custom-screen-xl">
        <div className="">
          <Link href="/services">
          <Image src='/logo.png' width={50} height={50} alt="logo" priority={true}/>
          </Link>
        </div>
        <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto sm:flex-1 lg:block">
          <ul className="flex items-center overflow-x-auto sm:ml-12">
            <li className="py-3 border-b-[1.5px] border-zinc-800">
              <Link
                className="block py-1.5 px-3 rounded-lg text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 duration-150"
                href="/services"
              >
                Services
              </Link>
            </li>
            <li className="py-3 border-b-[1.5px] border-transparent">
              <Link
                className="block py-1.5 px-3 rounded-lg text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 duration-150"
                href="/dashboard/settings"
              >
                Settings
              </Link>
            </li>
          </ul>
        </div>
        {/* <div className="order-2 flex-shrink-0 sm:order-3">
          <button
            type="button"
            id="radix-:r3:"
            aria-haspopup="menu"
            aria-expanded="false"
            data-state="closed"
            className="outline-none"
          >
            <span className="flex shrink-0 overflow-hidden rounded-full w-10 h-10 relative">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-white text-sm font-medium bg-gradient-to-r from-teal-400 to-blue-500"></span>
            </span>
          </button>
        </div> */}
      </nav>
    </header>
  );
}
