import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { type Database } from "@/types/database.types";

export const createClient = () => {
  return createClientComponentClient<Database>();
};

// Create a singleton instance for use in components
export const supabase = createClient();
