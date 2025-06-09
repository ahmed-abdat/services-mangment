import { VerifyEmailForm } from "@/features/auth/components/verify-email";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Await params according to Next.js 15 async request APIs
  const { locale } = await params;
  return <VerifyEmailForm locale={locale} />;
}
