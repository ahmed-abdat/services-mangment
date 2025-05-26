"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuthMessageProps {
  type: "error" | "success";
  message: string | null;
  unverifiedEmail?: string | null;
}

export function AuthMessage({
  type,
  message,
  unverifiedEmail,
}: AuthMessageProps) {
  if (!message && !unverifiedEmail) return null;

  return (
    <Alert
      variant={type === "error" ? "destructive" : "default"}
      className={cn(
        "border-l-4",
        type === "success"
          ? "border-l-green-500 bg-green-50/30 dark:bg-green-950/10 text-green-800 dark:text-green-300"
          : "border-l-destructive bg-destructive/10 text-destructive"
      )}
    >
      {type === "error" ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      )}
      <AlertDescription className="flex flex-col gap-2">
        <span className="font-medium">{message}</span>
      </AlertDescription>
    </Alert>
  );
}
