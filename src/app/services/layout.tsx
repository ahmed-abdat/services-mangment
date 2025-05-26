
import DashboardLinks from "@/features/dashboard/components/DashboardLinks";
import Header from "@/components/Header";
import { getUser } from "@/app/actions";
import { redirect } from "next/navigation";
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }
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
