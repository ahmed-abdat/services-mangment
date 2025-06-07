"use server";

import { createServiceClient } from "@/utils/supabase/service";

// Type definitions for notification data
export interface NotificationAccount {
  type: "personal" | "shared";
  accountName: string;
  serviceName: string;
  expirationDate: string;
  userName: string;
  phoneNumber: string;
  hasPhone: boolean;
}

export interface ExpiringAccountsResult {
  summary: {
    totalAccounts: number;
    personalAccounts: number;
    sharedAccounts: number;
    dateRange: string;
    daysAhead: number;
  };
  accounts: NotificationAccount[];
}

/**
 * Get accounts expiring within specified days
 * This server action handles all the database queries for expiring accounts
 */
export async function getExpiringAccounts(daysAhead: number = 7): Promise<{
  success: boolean;
  data?: ExpiringAccountsResult;
  error?: string;
}> {
  try {
    const supabase = createServiceClient();

    // Calculate target date range (using local date format to avoid timezone issues)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    // Format dates as YYYY-MM-DD in local timezone (not UTC)
    const startDateString =
      startDate.getFullYear() +
      "-" +
      String(startDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(startDate.getDate()).padStart(2, "0");

    const endDateString =
      endDate.getFullYear() +
      "-" +
      String(endDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(endDate.getDate()).padStart(2, "0");

    console.log(
      `Fetching accounts expiring between ${startDateString} and ${endDateString}`
    );

    // Find personal accounts expiring in the range
    const { data: personalAccounts, error: personalError } = await supabase
      .from("accounts")
      .select(
        `
        id, name, email, expires_at, account_type,
        user_full_name, user_phone_number, service_id,
        services (id, name)
      `
      )
      .eq("account_type", "personal")
      .gte("expires_at", startDateString)
      .lte("expires_at", endDateString)
      .not("expires_at", "is", null);

    if (personalError) {
      console.error("Error fetching personal accounts:", personalError);
      return { success: false, error: personalError.message };
    }

    // Find shared account users expiring in the range
    const { data: usersExpiring, error: usersError } = await supabase
      .from("users")
      .select("*")
      .gte("ending_date", startDateString)
      .lte("ending_date", endDateString);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return { success: false, error: usersError.message };
    }

    // Get account details for shared users (fix N+1 query problem)
    let sharedUsers: any[] = [];
    if (usersExpiring && usersExpiring.length > 0) {
      // Collect all account IDs
      const accountIds = usersExpiring.map((user) => user.account_id);

      // Single query to fetch all accounts
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select(
          `
          id, name, email, account_type, service_id,
          services (id, name)
        `
        )
        .in("id", accountIds);

      if (accountsError) {
        console.error(
          "Error fetching accounts for shared users:",
          accountsError
        );
      } else if (accounts) {
        // Create a map for O(1) lookup
        const accountsMap = new Map(
          accounts.map((account) => [account.id, account])
        );

        // Map users to their accounts
        sharedUsers = usersExpiring
          .map((user) => {
            const account = accountsMap.get(user.account_id);
            return account ? { ...user, accounts: account } : null;
          })
          .filter(Boolean); // Remove null entries
      }
    }

    const personalCount = personalAccounts?.length || 0;
    const sharedCount = sharedUsers?.length || 0;
    const totalCount = personalCount + sharedCount;

    // Build results
    const result: ExpiringAccountsResult = {
      summary: {
        totalAccounts: totalCount,
        personalAccounts: personalCount,
        sharedAccounts: sharedCount,
        dateRange: `${startDateString} to ${endDateString}`,
        daysAhead,
      },
      accounts: [],
    };

    // Add personal accounts
    (personalAccounts || []).forEach((account) => {
      result.accounts.push({
        type: "personal",
        accountName: account.name,
        serviceName: (account.services as any)?.name || "Unknown Service",
        expirationDate: account.expires_at,
        userName: account.user_full_name || "Unknown User",
        phoneNumber: account.user_phone_number || "",
        hasPhone: !!account.user_phone_number,
      });
    });

    // Add shared users
    sharedUsers.forEach((user) => {
      result.accounts.push({
        type: "shared",
        accountName: user.accounts.name,
        serviceName: user.accounts.services?.name || "Unknown Service",
        expirationDate: user.ending_date,
        userName: user.full_name || "Unknown User",
        phoneNumber: user.phone_number || "",
        hasPhone: !!user.phone_number,
      });
    });

    console.log(
      `Found ${totalCount} expiring accounts (${personalCount} personal, ${sharedCount} shared)`
    );

    return { success: true, data: result };
  } catch (error) {
    console.error("Error in getExpiringAccounts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all accounts with phone numbers (for testing purposes)
 */
export async function getAccountsWithPhones(): Promise<{
  success: boolean;
  data?: NotificationAccount[];
  error?: string;
}> {
  try {
    const supabase = createServiceClient();

    // Get personal accounts with phone numbers
    const { data: personalAccounts, error: personalError } = await supabase
      .from("accounts")
      .select(
        `
        id, name, email, expires_at, account_type,
        user_full_name, user_phone_number, service_id,
        services (id, name)
      `
      )
      .eq("account_type", "personal")
      .not("user_phone_number", "is", null)
      .neq("user_phone_number", "");

    if (personalError) {
      console.error("Error fetching personal accounts:", personalError);
      return { success: false, error: personalError.message };
    }

    // Get shared users with phone numbers
    const { data: usersWithPhones, error: usersError } = await supabase
      .from("users")
      .select("*")
      .not("phone_number", "is", null)
      .neq("phone_number", "");

    if (usersError) {
      console.error("Error fetching users with phones:", usersError);
      return { success: false, error: usersError.message };
    }

    // Get account details for shared users (fix N+1 query problem)
    let sharedUsers: any[] = [];
    if (usersWithPhones && usersWithPhones.length > 0) {
      // Collect all account IDs
      const accountIds = usersWithPhones.map((user) => user.account_id);

      // Single query to fetch all accounts
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select(
          `
          id, name, email, account_type, service_id,
          services (id, name)
        `
        )
        .in("id", accountIds);

      if (accountsError) {
        console.error(
          "Error fetching accounts for shared users:",
          accountsError
        );
      } else if (accounts) {
        // Create a map for O(1) lookup
        const accountsMap = new Map(
          accounts.map((account) => [account.id, account])
        );

        // Map users to their accounts
        sharedUsers = usersWithPhones
          .map((user) => {
            const account = accountsMap.get(user.account_id);
            return account ? { ...user, accounts: account } : null;
          })
          .filter(Boolean); // Remove null entries
      }
    }

    const accounts: NotificationAccount[] = [];

    // Add personal accounts
    (personalAccounts || []).forEach((account) => {
      accounts.push({
        type: "personal",
        accountName: account.name,
        serviceName: (account.services as any)?.name || "Unknown Service",
        expirationDate: account.expires_at || "No expiration",
        userName: account.user_full_name || "Unknown User",
        phoneNumber: account.user_phone_number || "",
        hasPhone: !!account.user_phone_number,
      });
    });

    // Add shared users
    sharedUsers.forEach((user) => {
      accounts.push({
        type: "shared",
        accountName: user.accounts.name,
        serviceName: user.accounts.services?.name || "Unknown Service",
        expirationDate: user.ending_date || "No expiration",
        userName: user.full_name || "Unknown User",
        phoneNumber: user.phone_number || "",
        hasPhone: !!user.phone_number,
      });
    });

    console.log(`Found ${accounts.length} accounts with phone numbers`);

    return { success: true, data: accounts };
  } catch (error) {
    console.error("Error in getAccountsWithPhones:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validate GREEN-API credentials and instance state
 */
export async function validateGreenApiConnection(): Promise<{
  success: boolean;
  state?: string;
  isAuthorized?: boolean;
  error?: string;
}> {
  try {
    const instanceId = process.env.GREEN_API_ID_INSTANCE;
    const accessToken = process.env.GREEN_API_ACCESS_TOKEN;

    if (!instanceId || !accessToken) {
      return {
        success: false,
        error: "GREEN-API credentials not configured",
      };
    }

    // Use correct GREEN-API URL format (no subdomain)
    const stateUrl = `https://api.greenapi.com/waInstance${instanceId}/getStateInstance/${accessToken}`;

    // Add timeout and proper headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(stateUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `State check failed: ${response.status}`,
        };
      }

      const stateData = await response.json();
      const isAuthorized = stateData.stateInstance === "authorized";

      return {
        success: true,
        state: stateData.stateInstance,
        isAuthorized,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return {
          success: false,
          error: "Request timeout - GREEN-API took too long to respond",
        };
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Error validating GREEN-API connection:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}
