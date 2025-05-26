import Image from "next/image";
import { getUser } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const user = await getUser();
  console.log("from auth layout", user);

  return (
    <div className="h-screen w-full overflow-hidden bg-white dark:bg-gray-900">
      {/* Subtle background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50/50 dark:bg-blue-900/5 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-50/50 dark:bg-blue-900/5 rounded-tr-full"></div>
      </div>

      <main className="relative z-10 h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[400px] flex flex-col items-center">
          {/* Logo */}
          <div className="mb-6">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Services Management"
                width={48}
                height={48}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Auth Form Container */}
          <div className="w-full relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md ring-1 ring-gray-200 dark:ring-gray-700 card-hover-effect">
            <div className="p-6">{children}</div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>
              © {new Date().getFullYear()} Services Management. All rights
              reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
