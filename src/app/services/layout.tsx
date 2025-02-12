import DashboardLinks from "@/components/dashboard/DashboardLinks";
import Header from "@/components/Header";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services Management",
  description:
    "Manage your RIMcode services, accounts, and user subscriptions in one place.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Services Management | RIMcode Dashboard",
    description:
      "Manage your RIMcode services, accounts, and user subscriptions in one place.",
  },
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mb-6">
      <section className="mx-auto px-4 max-w-[1024px]" dir="ltr">
        <Header />
        <DashboardLinks />
        {children}
      </section>
    </main>
  );
}
