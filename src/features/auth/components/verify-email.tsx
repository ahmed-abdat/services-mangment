"use client";

import { Mail, ArrowLeft, ArrowRight, Inbox, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function VerifyEmailForm({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams?.get("email") || "";

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Email Icon */}
      <div className="flex justify-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      {/* Title and Description */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">
          {locale === "ar" ? "تحقق من بريدك الإلكتروني" : "Check Your Email"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {locale === "ar"
            ? "لقد قمنا بإرسال رابط للتحقق من بريدك الإلكتروني. يرجى التحقق من صندوق البريد الإلكتروني الخاص بك."
            : "We've sent a verification link to your email address. Please check your inbox and verify your email."}
        </p>
        {email && <p className="mt-1 text-sm font-medium">{email}</p>}
      </div>

      {/* Email Steps */}
      <div className="space-y-4">
        <div className="overflow-hidden rounded-lg border bg-card/50">
          <div className="flex items-center gap-4 p-4 border-b">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Inbox className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {locale === "ar" ? "الخطوة الأولى" : "Step 1"}
              </p>
              <p className="text-sm text-muted-foreground">
                {locale === "ar"
                  ? "افتح بريدك الإلكتروني"
                  : "Open your email inbox"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {locale === "ar" ? "الخطوة الثانية" : "Step 2"}
              </p>
              <p className="text-sm text-muted-foreground">
                {locale === "ar"
                  ? "انقر على رابط التحقق في البريد الإلكتروني"
                  : "Click the verification link in the email"}
              </p>
            </div>
          </div>
        </div>

        {/* Spam Note */}
        <Alert
          variant="default"
          className="bg-muted/50 border-muted-foreground/20"
        >
          <AlertDescription className="text-sm text-muted-foreground">
            {locale === "ar"
              ? "إذا لم تجد البريد الإلكتروني، يرجى التحقق من مجلد البريد العشوائي أو الرسائل غير المرغوب فيها."
              : "If you don't see the email, please check your spam folder or junk mail."}
          </AlertDescription>
        </Alert>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/login")}
        >
          <span className="flex items-center justify-center">
            {locale === "ar" ? (
              <>
                العودة إلى تسجيل الدخول
                <ArrowLeft className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </>
            )}
          </span>
        </Button>
      </div>
    </div>
  );
}
