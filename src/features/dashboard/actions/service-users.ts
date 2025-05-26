"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { TUserData, ServiceUsersInsert } from "../types/dashboard.types";
import moment from "moment";

// Calculate subscription duration in days between start and end dates
function calculateSubscriptionDuration(
  starting_date: string,
  ending_date: string
): number {
  const start = moment(starting_date);
  const end = moment(ending_date);

  // Calculate the difference in days (inclusive of both start and end dates)
  return end.diff(start, "days") + 1;
}

// Calculate remaining days until expiration from today
function calculateRemainingDays(ending_date: string): number {
  const now = moment().startOf("day");
  const end = moment(ending_date).endOf("day");

  // If already expired, return 0
  if (now.isAfter(end)) {
    return 0;
  }

  // Return remaining days until expiration (inclusive of end date)
  return end.diff(now, "days") + 1;
}

// This function is removed - use calculateSubscriptionDuration or calculateRemainingDays instead

// Add new account user
export async function addAccountUser(
  serviceId: string,
  accountId: string,
  user: TUserData
) {
  const supabase = await createClient();

  try {
    const newUser: ServiceUsersInsert = {
      account_id: accountId,
      full_name: user.full_name,
      phone_number: user.phone_number,
      description: user.description,
      starting_date: user.starting_date,
      ending_date: user.ending_date,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("users").insert(newUser);

    if (error) throw error;

    revalidatePath(`/services/${serviceId}/${accountId}`);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error adding user:", error);
    return { success: false, error: "Error adding user" };
  }
}

// Get account user
export async function getAccountUser(
  serviceId: string,
  accountId: string,
  userId: string
) {
  if (!serviceId || !accountId || !userId)
    return { success: false, user: null };

  const supabase = await createClient();

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("account_id", accountId)
      .eq("id", userId)
      .single();

    if (error) {
      return { success: false, user: null, error: error.message };
    }

    if (user) {
      // Calculate subscription duration between start and end dates
      const subscriptionDuration = calculateSubscriptionDuration(
        user.starting_date,
        user.ending_date
      );
      return {
        success: true,
        user: { ...user, subscriptionDuration },
        error: null,
      };
    }

    return { success: false, user: null, error: "User not found" };
  } catch (error) {
    console.error("Error getting user:", error);
    return { success: false, user: null, error: "Error getting user" };
  }
}

// Get all account users
export async function getAccountUsers(serviceId: string, accountId: string) {
  const supabase = await createClient();

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("account_id", accountId);

    if (error) throw error;

    const usersWithDuration = users.map((user) => ({
      ...user,
      subscriptionDuration: calculateSubscriptionDuration(
        user.starting_date,
        user.ending_date
      ),
    }));

    return { success: true, users: usersWithDuration };
  } catch (error) {
    console.error("Error getting users:", error);
    return { success: false, users: [] };
  }
}

// Update account user
export async function updateAccountUser(
  serviceId: string,
  accountId: string,
  userId: string,
  updates: Partial<TUserData>
) {
  const supabase = await createClient();

  try {
    const updateData = {
      ...updates,
    };

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .eq("account_id", accountId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/services/${serviceId}/${accountId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Error updating user" };
  }
}

// Delete account user
export async function deleteAccountUser(
  serviceId: string,
  accountId: string,
  userId: string
) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId)
      .eq("account_id", accountId);

    if (error) throw error;

    revalidatePath(`/services/${serviceId}/${accountId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false };
  }
}

// Delete multiple specific users by their IDs
export async function deleteMultipleAccountUsers(
  serviceId: string,
  accountId: string,
  userIds: string[]
) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("account_id", accountId)
      .in("id", userIds);

    if (error) throw error;

    revalidatePath(`/services/${serviceId}/${accountId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting multiple users:", error);
    return { success: false };
  }
}

// Delete all account users
export async function deleteAllAccountUsers(
  serviceId: string,
  accountId: string
) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("account_id", accountId);

    if (error) throw error;

    revalidatePath(`/services/${serviceId}/${accountId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting users:", error);
    return { success: false };
  }
}
