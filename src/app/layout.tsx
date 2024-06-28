import { tajawal, roboto } from "@/app/font/font";
import { Toaster } from "sonner";
import "./globals.css";
import { Metadata, Viewport } from "next";





export const metadata: Metadata = {
  title: {
    default: "الاتحاد الوطني لطلبة موريتانيا",
    template: "%s | الاتحاد الوطني",
  },
  description: "الاتحاد الوطني لطلبة موريتانيا - الأخبار والمنشورات",
};

export const viewport: Viewport = {
  themeColor: "#58cc02",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${roboto.className} ${tajawal.className}`}>
        {children}
        <Toaster position="top-center" richColors dir="ltr" />
      </body>
    </html>
  );
}
