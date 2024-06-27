import { Tajawal, Roboto } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";


export const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${roboto.className}`}>
        {children}
        <Toaster position="top-center" richColors dir="ltr" />
      </body>
    </html>
  );
}
