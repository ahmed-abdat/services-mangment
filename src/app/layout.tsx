import { tajawal, roboto } from "@/app/font/font";
import { Toaster } from "sonner";
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://services-mangment.vercel.app/"
  ),
  title: {
    default: "RIMcode Services Dashboard",
    template: "%s | RIMcode Dashboard",
  },
  description:
    "RIMcode's service management dashboard for managing and monitoring services, accounts, and user subscriptions.",
  keywords: ["RIMcode", "services", "dashboard", "management", "subscriptions"],
  authors: [{ name: "RIMcode" }],
  creator: "RIMcode",
  publisher: "RIMcode",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "RIMcode Services Dashboard",
    title: "RIMcode Services Dashboard",
    description:
      "RIMcode's service management dashboard for managing and monitoring services, accounts, and user subscriptions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RIMcode Services Dashboard",
    description:
      "RIMcode's service management dashboard for managing and monitoring services, accounts, and user subscriptions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={`${roboto.className} ${tajawal.className}`}>
        {children}
        <Toaster position="top-center" richColors dir="ltr" />
      </body>
    </html>
  );
}
