import { app } from "@/config/firebase";
import { getFirestore } from "firebase/firestore/lite";
import { Timestamp } from "firebase/firestore/lite";
import moment from "moment";

export const firestore = getFirestore(app);

// Shared response type for all actions
export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Calculate reminder days (used in user management)
export const calculateReminderDays = (
  startingDate: Timestamp | null,
  endingDate: Timestamp | null
): number => {
  if (!startingDate || !endingDate) return 0;

  const now = moment().startOf("day"); // Start of today
  const end = moment(endingDate.toDate()).endOf("day"); // End of the end date

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
export function formatFirebaseDate(date: Timestamp | null): string | null {
  if (!date) return null;
  return moment(date.toDate()).format("YYYY/MM/DD");
}

// Check if a document exists
export function isExpired(date: Timestamp | null): boolean {
  if (!date) return true;
  return moment().isAfter(moment(date.toDate()));
}
