"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, Mail, Link as LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/features/auth/components/shared/password-input";
import { AuthMessage } from "@/features/auth/components/shared/auth-message";
import { ButtonSpinner } from "@/components/ui/loading";
import { login } from "../actions/login";
import {
  LoginFormValues,
  loginSchema,
} from "@/features/auth/validations/login-schema";
import { getUser } from "@/app/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Check for verification success message and errors
  useEffect(() => {
    if (searchParams?.get("verified") === "true") {
      setSuccess("email_verified");
    }

    // Handle URL error parameters
    const urlError = searchParams?.get("error");
    const errorCode = searchParams?.get("error_code");
    const errorDescription = searchParams?.get("error_description");

    if (urlError || errorCode || errorDescription) {
      if (
        errorCode === "otp_expired" ||
        errorDescription?.includes("expired")
      ) {
        setError("link_expired");
      } else if (urlError === "No code provided") {
        setError("invalid_link");
      } else if (errorCode === "access_denied") {
        setError("access_denied");
      } else {
        setError("error");
      }
    }
  }, [searchParams]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      setError(null);
      setUnverifiedEmail(null);
      setIsPending(true);

      const result = await login(values);

      const user = await getUser();

      if (user) {
        toast.success("login_success");
        router.push(`/`);
        return;
      }

      // Handle errors
      const errorMessage = result?.error?.toLowerCase() || "";
      if (errorMessage.includes("invalid login credentials")) {
        setError("invalid_credentials");
      } else if (errorMessage.includes("email not confirmed")) {
        setError("email_not_confirmed");
        setUnverifiedEmail(values.email);
      } else if (errorMessage.includes("too many requests")) {
        setError("too_many_requests");
      } else if (errorMessage.includes("network")) {
        setError("network_error");
      } else if (errorMessage.includes("rate limit")) {
        setError("rate_limit");
      } else if (errorMessage.includes("pending approval")) {
        setError("pending_approval");
      } else if (errorMessage.includes("profile not found")) {
        setError("profile_not_found");
      } else {
        setError("error");
      }
    } catch (error) {
      console.error(error);
      setError("error");
    } finally {
      setIsPending(false);
    }
  }

  const signupLink = `/signup`;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold text-primary">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      {!error && !isPending && success && (
        <AuthMessage type="success" message={success} />
      )}
      <AuthMessage
        type="error"
        message={error}
        unverifiedEmail={unverifiedEmail}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>

                <FormControl>
                  <PasswordInput placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center justify-center">
                <ButtonSpinner />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </Form>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/30"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">
            or
          </span>
        </div>
      </div>

      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href={signupLink} className="font-medium text-primary">
            Create Account
          </a>
        </p>
      </div>
    </div>
  );
}
