
"use server"

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function signOut() {
  const supabase = await createClient();

    const { error } = await supabase.auth.signOut();
  
    if (error) {
      return { error: error.message };
    }
  
  revalidatePath("/", "layout");
}
