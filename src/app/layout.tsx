import { tajawal, roboto } from "@/app/font/font";
import { Toaster } from "sonner";
import "./globals.css";
import { Metadata } from "next";





export const metadata: Metadata = {
  title: {
    default: 'Farmasi RIM ',
    template: "%s | Farmasi RIM",
  },
  description: "Farmasi RIM",
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
