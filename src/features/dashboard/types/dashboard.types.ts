import { Database } from "@/types/database.types";

// Service Types
export interface Service {
  id: string;
  name: string;
  thumbnail_url: string | null;
  created_at: string | null;
}

// For creating a new service where ID is optional (will be generated on server)
export interface ServiceCreate {
  name: string;
  thumbnail_url?: string | null;
}

export interface Thumbnail {
  url: string;
  name: string; // Storage path for reliable deletion/management
  fileName?: string; // Original filename for display
  file?: File;
}

// Service Account Types
export interface ServiceAccount {
  id: string;
  name: string;
  thumbnail: Thumbnail | null;
  details?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// User Types
export interface TUserData {
  full_name: string;
  phone_number?: string;
  description?: string;
  starting_date: string;
  ending_date: string;
}

export interface TUserTable extends TUserData {
  id: string;
  reminderDays: number;
  subscription_status?: "active" | "expired" | "pending"; // Computed property, not in DB
}

// Database Types
export type ServicesRow = Database["public"]["Tables"]["services"]["Row"];
export type ServicesInsert = Database["public"]["Tables"]["services"]["Insert"];
export type ServicesUpdate = Database["public"]["Tables"]["services"]["Update"];

export type ServiceAccountsRow =
  Database["public"]["Tables"]["accounts"]["Row"];
export type ServiceAccountsInsert =
  Database["public"]["Tables"]["accounts"]["Insert"];
export type ServiceAccountsUpdate =
  Database["public"]["Tables"]["accounts"]["Update"];

export type ServiceUsersRow = Database["public"]["Tables"]["users"]["Row"];
export type ServiceUsersInsert =
  Database["public"]["Tables"]["users"]["Insert"];
export type ServiceUsersUpdate =
  Database["public"]["Tables"]["users"]["Update"];
