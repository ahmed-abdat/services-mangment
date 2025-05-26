"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { RegisterFormValues } from "../validations/register-schema";
import { isUserExist } from "@/app/actions";

/**
 * Check if a user with the given email already exists
 * @param email The email to check
 * @returns Object indicating if user exists and any error
 */
export async function checkUserExists(email: string) {
  try {
    const profile = await isUserExist(email);

    if (profile) {
      return { id: profile.id, exists: true };
    }

    return { exists: false };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message, exists: false };
    }
    return { error: "Failed to check if user exists", exists: false };
  }
}

export async function signupUser(values: RegisterFormValues) {
  const supabase = await createClient();

  try {
    // Check if user already exists in our profiles table
    const userExistsCheck = await checkUserExists(values.email);

    if (userExistsCheck.error) {
      return { error: userExistsCheck.error };
    }

    if (userExistsCheck.exists) {
      return { error: "User with this email already exists" };
    }

    // Validate environment variables are defined
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL environment variable is not defined"
      );
    }

    if (!process.env.NEXT_PUBLIC_VERIFY_EMAIL_REDIRECT) {
      throw new Error(
        "NEXT_PUBLIC_VERIFY_EMAIL_REDIRECT environment variable is not defined"
      );
    }

    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/${process.env.NEXT_PUBLIC_VERIFY_EMAIL_REDIRECT}`;

    // Attempt to sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.name,
        },
        emailRedirectTo: redirectTo,
      },
    });

    if (authError) {
      // Handle specific error cases from Supabase
      if (authError.message.includes("already registered")) {
        return { error: "User with this email already exists" };
      }

      return { error: authError.message };
    }

    if (!authData?.user?.id) {
      return { error: "Failed to create user" };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create user" };
  }
}
