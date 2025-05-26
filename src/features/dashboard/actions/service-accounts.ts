"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  ServiceAccount,
  ServiceAccountsInsert,
} from "../types/dashboard.types";
import { TAccountsService } from "@/lib/validations/service-accounts/accounts-services";

// Add new service account
export async function addServiceAccount(
  serviceId: string,
  account: TAccountsService
) {
  const supabase = await createClient();

  try {
    // get the service thumbnail url
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("thumbnail_url")
      .eq("id", serviceId)
      .single();

    const newAccount: ServiceAccountsInsert = {
      service_id: serviceId,
      name: account.name,
      email: account.email, // Use the email field from the form
      details: account.details || null,
      created_at: new Date().toISOString(),
      thumbnail_url: service?.thumbnail_url || null,
    };

    const { error } = await supabase
      .from("accounts")
      .insert(newAccount);

    if (error) throw error;

    revalidatePath(`/services/${serviceId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding service account:", error);
    return { success: false };
  }
}

// Get service account
export async function getServiceAccount(serviceId: string, accountId: string) {
  if (!serviceId || !accountId) return { success: false, account: null };

  const supabase = await createClient();

  try {
    const { data: account, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("service_id", serviceId)
      .eq("id", accountId)
      .single();

    if (error) throw error;

    return { success: true, account };
  } catch (error) {
    console.error("Error getting service account:", error);
    return { success: false, account: null };
  }
}

// Check if account name exists
export async function checkIfAccountNameExists(
  serviceId: string,
  name: string
) {
  if (!serviceId || !name) return { success: false, account: null };

  const supabase = await createClient();

  try {
    const { data: account, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("service_id", serviceId)
      .eq("name", name)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return { success: false, account: null };
      }
      throw error;
    }

    return { success: true, account };
  } catch (error) {
    console.error("Error checking account name:", error);
    return { success: false, account: null };
  }
}

// Get all service accounts
export async function getServiceAccounts(serviceId: string) {
  const supabase = await createClient();

  try {
    const { data: accounts, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("service_id", serviceId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, accounts };
  } catch (error) {
    console.error("Error getting service accounts:", error);
    return { success: false, accounts: [] };
  }
}

// Update service account
export async function updateServiceAccount(
  serviceId: string,
  accountId: string,
  account: TAccountsService
) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("accounts")
      .update({
        name: account.name,
        email: account.email,
        details: account.details || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", accountId)
      .eq("service_id", serviceId);

    if (error) throw error;

    revalidatePath(`/services/${serviceId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating service account:", error);
    return { success: false };
  }
}

// Delete service account
export async function deleteServiceAccount(
  serviceId: string,
  accountId: string
) {
  const supabase = await createClient();

  try {
    // Delete the account (cascade delete should handle related users)
    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", accountId)
      .eq("service_id", serviceId);

    if (error) throw error;

    revalidatePath(`/services/${serviceId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting service account:", error);
    return { success: false };
  }
}
