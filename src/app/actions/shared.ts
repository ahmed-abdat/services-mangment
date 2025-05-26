import moment from "moment";
import { createClient } from "@/utils/supabase/server";

// Shared response type for all actions
export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Calculate subscription duration between start and end dates
// This represents the total duration of the subscription in days
export const calculateSubscriptionDuration = (
  starting_date: string | null,
  ending_date: string | null
): number => {
  if (!starting_date || !ending_date) return 0;

  const start = moment(starting_date);
  const end = moment(ending_date);

  // Calculate the difference in days (inclusive of both start and end dates)
  return end.diff(start, "days") + 1;
};

// Calculate remaining days until expiration from today
export const calculateRemainingDays = (ending_date: string | null): number => {
  if (!ending_date) return 0;

  const now = moment().startOf("day");
  const end = moment(ending_date).endOf("day");

  // If already expired, return 0
  if (now.isAfter(end)) {
    return 0;
  }

  // Return remaining days until expiration (inclusive of end date)
  return end.diff(now, "days") + 1;
};

// Error handler wrapper for actions
export async function handleActionError<T>(
  action: () => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const result = await action();
    return { success: true, data: result };
  } catch (error) {
    console.error("Action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Validate required fields
export function validateRequiredFields(
  fields: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter((field) => !fields[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

// Format date for consistency
export function formatDate(date: string | null): string | null {
  if (!date) return null;
  return moment(date).format("YYYY/MM/DD");
}

// Check if a date is expired
export function isExpired(date: string | null): boolean {
  if (!date) return true;
  return moment().isAfter(moment(date));
}

// Get Supabase client
export async function getSupabaseClient() {
  return await createClient();
}
