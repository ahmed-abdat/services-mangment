import NextBreadcrumb from '@/components/dashboard/DashboardLinks';
import DashboardLinks from '@/components/dashboard/DashboardLinks';
import Header from '@/components/Header';
import { usePathname } from 'next/navigation';
import React from 'react'

export default function DashboardLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {

    return (
<main className=' '>
    {/* <Login /> */}
    <section className="mx-auto px-4 max-w-[1024px]" dir='ltr'>
        <Header />
        <NextBreadcrumb
        separator="/"
        containerClasses="flex item-center gap-x-2"
        listClasses="text-gray-500"
        activeClasses="font-bold text-black"
        capitalizeLinks={true}
      />
     {children}
    </section>
</main>
    );
  }