"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  ServiceAccount,
  ServiceAccountsInsert,
} from "../types/dashboard.types";
import { TAccountsService } from "../validations/accounts";

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
      expires_at: account.expires_at || null,
      account_type: account.account_type || "shared",
      // Personal user fields (only for personal accounts)
      user_full_name: account.user_full_name || null,
      user_phone_number: account.user_phone_number || null,
      account_starting_date: account.account_starting_date || null,
      account_ending_date: account.account_ending_date || null,
      created_at: new Date().toISOString(),
      thumbnail_url: service?.thumbnail_url || null,
    };

    const { data: insertedAccount, error } = await supabase
      .from("accounts")
      .insert(newAccount)
      .select("id")
      .single();

    if (error) throw error;

    revalidatePath(`/services/${serviceId}`);
    return { success: true, accountId: insertedAccount?.id };
  } catch (error) {
    console.error("Error adding service account:", error);
    return { success: false, accountId: null };
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

// Get all service accounts sorted by expiration date (expiring soonest first)
export async function getServiceAccounts(serviceId: string) {
  const supabase = await createClient();

  try {
    const { data: accounts, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("service_id", serviceId)
      // Sort by expiration date: accounts with expires_at first (ascending), then nulls last
      // This puts expiring accounts at the top, with the soonest expiring first
      .order("expires_at", { ascending: true, nullsFirst: false })
      // Secondary sort by created_at for accounts with same/null expiration dates
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
        expires_at: account.expires_at || null,
        account_type: account.account_type || "shared",
        // Personal user fields (only for personal accounts)
        user_full_name: account.user_full_name || null,
        user_phone_number: account.user_phone_number || null,
        account_starting_date: account.account_starting_date || null,
        account_ending_date: account.account_ending_date || null,
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

// Delete service account with best practices for error handling
export async function deleteServiceAccount(
  serviceId: string,
  accountId: string
) {
  const supabase = await createClient();

  try {
    // Step 1: Validate input parameters early
    if (!serviceId) {
      return {
        success: false,
        error: "Service ID is required for account deletion",
      };
    }

    if (!accountId) {
      return {
        success: false,
        error: "Account ID is required for deletion",
      };
    }

    // Step 2: Check if account exists before attempting deletion
    const { data: existingAccount, error: checkError } = await supabase
      .from("accounts")
      .select("id, name")
      .eq("id", accountId)
      .eq("service_id", serviceId)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        // Account not found
        return {
          success: false,
          error: "Account not found",
        };
      }
      console.error("Error checking account existence:", checkError);
      return {
        success: false,
        error: "Failed to verify account existence",
      };
    }

    // Step 3: Delete the account from the database
    // Note: Cascade delete should handle related users automatically
    const { error: deleteError } = await supabase
      .from("accounts")
      .delete()
      .eq("id", accountId)
      .eq("service_id", serviceId);

    if (deleteError) {
      console.error("Error deleting account from database:", deleteError);
      return {
        success: false,
        error: `Failed to delete account: ${deleteError.message}`,
      };
    }

    // Step 4: Revalidate the cache after successful deletion
    revalidatePath(`/services/${serviceId}`);

    return {
      success: true,
      message: `Account "${existingAccount.name}" deleted successfully`,
    };
  } catch (error) {
    console.error("Unexpected error in deleteServiceAccount:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting the account",
    };
  }
}
