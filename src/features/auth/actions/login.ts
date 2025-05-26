"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { LoginFormValues } from "../validations/login-schema";

export async function login(
  values: LoginFormValues,
) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(values);

  // UserResponse
  if (error) {
    return { error: error.message, user: null };
  }

  revalidatePath(`/`, "layout");

  // Return success with returnTo value if it exists
  return { success: true };
}
