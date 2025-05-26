import type { Database } from "@/types/database.types";

export type Profile = Database["public"]["Tables"]["auth_users"]["Row"];

export type UserResponse = Profile | null;

