import { NextRequest, NextResponse } from "next/server";
import { createArabicMessage } from "@/config/whatsapp-messages";
import { getExpiringAccounts } from "@/features/dashboard/actions/whatsapp-notifications";
import { createServiceClient } from "@/utils/supabase/service";

// Types for WhatsApp reminder system
interface ExpiringAccount {
  id: string;
  name: string;
  email: string;
  expires_at: string;
  account_type: "personal" | "shared";
  user_full_name: string | null;
  user_phone_number: string | null;
  service_id: string;
  services: {
    id: string;
    name: string;
  };
}

interface User {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  starting_date: string;
  ending_date: string;
}

/**
 * POST /api/send-whatsapp-reminders
 * Send WhatsApp reminders to users whose accounts/subscriptions are expiring
 * Requires API_SECRET_KEY authorization
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const apiSecretKey = process.env.API_SECRET_KEY;

    if (!authHeader || !authHeader.startsWith("Bearer ") || !apiSecretKey) {
      console.warn("Unauthorized access attempt to WhatsApp reminder API");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    if (token !== apiSecretKey) {
      console.warn("Invalid API key provided to WhatsApp reminder API");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { daysAhead } = await request.json();

    if (!daysAhead || daysAhead < 1 || daysAhead > 30) {
      return NextResponse.json(
        { error: "daysAhead must be between 1 and 30" },
        { status: 400 }
      );
    }

    // Calculate target date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    const targetDateString = targetDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD

    console.log(
      `Processing WhatsApp reminders for ${daysAhead} days ahead (${targetDateString})`
    );

    const supabase = createServiceClient();

    // Get PERSONAL accounts with expires_at in X days
    const { data: personalAccounts, error: personalError } = await supabase
      .from("accounts")
      .select(
        `
        id,
        name,
        email,
        expires_at,
        account_type,
        user_full_name,
        user_phone_number,
        service_id,
        services (
          id,
          name
        )
      `
      )
      .eq("account_type", "personal")
      .eq("expires_at", targetDateString)
      .not("expires_at", "is", null)
      .returns<ExpiringAccount[]>();

    if (personalError) {
      console.error("Error fetching personal accounts:", personalError);
    }

    // Get SHARED accounts with users expiring in X days (check users.ending_date)
    let usersExpiring: any[] = [];

    // Try direct date string comparison first
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("ending_date", targetDateString);

    if (usersError) {
      console.error("Error fetching users:", usersError);
    } else {
      usersExpiring = usersData || [];
    }

    // If no results, try alternative query methods
    if (usersExpiring.length === 0) {
      // Try range query as fallback
      const { data: rangeData, error: rangeError } = await supabase
        .from("users")
        .select("*")
        .gte("ending_date", targetDateString)
        .lte("ending_date", targetDateString);

      if (!rangeError && rangeData) {
        usersExpiring = rangeData;
      }
    }

    // Get account details for shared users
    let sharedUsers: any[] = [];
    if (usersExpiring && usersExpiring.length > 0) {
      for (const user of usersExpiring) {
        const { data: account, error: accountError } = await supabase
          .from("accounts")
          .select(
            `
            id,
            name,
            email,
            account_type,
            service_id,
            services (
              id,
              name
            )
          `
          )
          .eq("id", user.account_id)
          .single();

        if (accountError) {
          console.error(
            `Error getting account for user ${user.full_name}:`,
            accountError
          );
        } else if (account) {
          sharedUsers.push({
            ...user,
            accounts: account,
          });
        }
      }
    }

    // Combine results for processing
    const personalCount = personalAccounts?.length || 0;
    const sharedCount = sharedUsers?.length || 0;
    const totalCount = personalCount + sharedCount;

    console.log(
      `Found ${totalCount} users to notify (${personalCount} personal, ${sharedCount} shared)`
    );

    if (totalCount === 0) {
      return NextResponse.json({
        message: `No accounts expiring in ${daysAhead} days`,
        count: 0,
        targetDate: targetDateString,
      });
    }

    // Process personal accounts
    const personalPromises = (personalAccounts || []).map(async (account) => {
      try {
        if (account.user_phone_number) {
          return await sendWhatsAppReminder({
            phoneNumber: account.user_phone_number,
            userName: account.user_full_name || "المستخدم",
            accountName: account.name,
            serviceName: account.services.name,
            expiresInDays: daysAhead,
            expirationDate: account.expires_at,
          });
        } else {
          console.warn(`Personal account ${account.name} has no phone number`);
          return { success: false, error: "No phone number" };
        }
      } catch (error) {
        console.error(
          `Error processing personal account ${account.id}:`,
          error
        );
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    // Process shared account users
    const sharedPromises = (sharedUsers || []).map(async (user: any) => {
      try {
        if (user.phone_number) {
          return await sendWhatsAppReminder({
            phoneNumber: user.phone_number,
            userName: user.full_name || "المستخدم",
            accountName: user.accounts.name,
            serviceName: user.accounts.services.name,
            expiresInDays: daysAhead,
            expirationDate: user.ending_date,
          });
        } else {
          console.warn(`Shared user ${user.full_name} has no phone number`);
          return { success: false, error: "No phone number" };
        }
      } catch (error) {
        console.error(`Error processing shared user ${user.id}:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    // Combine all promises
    const reminderPromises = [...personalPromises, ...sharedPromises];

    // Wait for all reminders to be processed
    const results = await Promise.allSettled(reminderPromises);

    // Count successful and failed reminders
    const successful = results.filter(
      (result: any) => result.status === "fulfilled" && result.value.success
    ).length;

    const failed = results.filter(
      (result: any) =>
        result.status === "rejected" ||
        (result.status === "fulfilled" && !result.value.success)
    ).length;

    console.log(
      `WhatsApp reminder completed: ${successful} sent, ${failed} failed`
    );

    // Build summary of processed accounts
    const processedAccounts: any[] = [];

    // Add personal accounts to summary
    (personalAccounts || []).forEach((account) => {
      processedAccounts.push({
        accountName: account.name,
        serviceName: account.services.name,
        expirationDate: account.expires_at,
        accountType: "personal",
      });
    });

    // Add shared users to summary
    (sharedUsers || []).forEach((user: any) => {
      processedAccounts.push({
        accountName: user.accounts.name,
        serviceName: user.accounts.services.name,
        expirationDate: user.ending_date,
        accountType: "shared",
        userName: user.full_name,
      });
    });

    return NextResponse.json({
      message: `WhatsApp reminders processed for ${daysAhead} days ahead`,
      total: totalCount,
      successful,
      failed,
      daysAhead,
      targetDate: targetDateString,
      processed: processedAccounts,
    });
  } catch (error) {
    console.error("Error in send-whatsapp-reminders API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Send WhatsApp reminder using GREEN-API
 */
async function sendWhatsAppReminder({
  phoneNumber,
  userName,
  accountName,
  serviceName,
  expiresInDays,
  expirationDate,
}: {
  phoneNumber: string;
  userName: string;
  accountName: string;
  serviceName: string;
  expiresInDays: number;
  expirationDate: string;
}) {
  try {
    // Check environment variables
    const instanceId = process.env.GREEN_API_ID_INSTANCE;
    const accessToken = process.env.GREEN_API_ACCESS_TOKEN;

    if (!instanceId || !accessToken) {
      throw new Error("GREEN-API credentials not configured");
    }

    // Format phone number for GREEN-API
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Create Arabic message
    const message = createArabicMessage(expiresInDays, {
      userName,
      accountName,
      serviceName,
      expirationDate,
      expiresInDays,
    });

    // Send via GREEN-API (using correct URL format)
    const subdomain = instanceId.substring(0, 4);
    const response = await fetch(
      `https://${subdomain}.api.greenapi.com/waInstance${instanceId}/sendMessage/${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: `${formattedPhone}@c.us`,
          message: message,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GREEN-API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    // Only log successful sends, not the full response details for privacy
    console.log(
      `WhatsApp sent successfully to ${formattedPhone.slice(-4).padStart(8, "*")}`
    );

    return { success: true, result };
  } catch (error) {
    console.error(`Failed to send WhatsApp to ${phoneNumber}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Format phone number for GREEN-API - Smart country code handling
 * - Mauritania (222) is the default country
 * - If number already has ANY country code, leave it as-is
 * - If number has no country code, add Mauritania (222)
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digits
  let clean = phoneNumber.replace(/\D/g, "");

  // Common country codes to detect if number already has one
  const countryCodes = [
    "222",
    "216",
    "213",
    "212",
    "1",
    "33",
    "44",
    "49",
    "39",
    "34",
    "91",
    "86",
    "81",
    "7",
  ];

  // Check if the number already starts with a country code
  const hasCountryCode = countryCodes.some((code) => clean.startsWith(code));

  if (hasCountryCode) {
    // Number already has a country code, return as-is
    return clean;
  } else if (clean.length === 8) {
    // Mauritanian local number (8 digits), add country code 222
    return "222" + clean;
  } else if (clean.length > 10) {
    // Probably international number, return as-is
    return clean;
  } else {
    // Shorter number, assume it needs Mauritania country code
    return "222" + clean;
  }
}
