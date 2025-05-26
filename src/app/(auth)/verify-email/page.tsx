import { VerifyEmailForm } from "@/features/auth/components/verify-email";

export default function VerifyEmailPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  return <VerifyEmailForm locale={locale} />;
}
