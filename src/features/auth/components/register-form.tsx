"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, Mail, User, Link as LinkIcon } from "lucide-react";

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
import {
  RegisterFormValues,
  registerSchema,
} from "../validations/register-schema";
import { checkUserExists, signupUser } from "@/features/auth/actions/signup";
import { AuthMessage } from "@/features/auth/components/shared/auth-message";
import { ButtonSpinner } from "@/components/ui/loading";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      setError(null);
      setIsPending(true);

      // First, check if the user exists in our system
      const userExists = await checkUserExists(values.email);

      if (userExists?.exists) {
        setError("user_exists");
        setIsPending(false);
        return;
      }

      // If user doesn't exist, proceed with signup
      const result = await signupUser(values);

      if (result?.error) {
        // Handle specific error cases
        if (result.error.includes("already exists")) {
          setError("user_exists");
        } else {
          setError("signup_error");
        }
        setIsPending(false);
        return;
      }

      toast.success("signup_success");

      // Redirect to verification page on success
      router.replace(`/verify-email`);
    } catch (error) {
      setError("error");
      setIsPending(false);
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold text-primary">Create Account</h1>
        <p className="text-sm text-muted-foreground">
          Sign up to get started with our services
        </p>
      </div>

      <AuthMessage type="error" message={error} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="John Doe"
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
                  <PasswordInput
                    placeholder="Create a secure password"
                    {...field}
                  />
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
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Sign Up
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
          Already have an account?{" "}
          <a href="/login" className="font-medium text-primary">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
