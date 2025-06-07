import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { validateGreenApiConnection } from "@/features/dashboard/actions/whatsapp-notifications";

/**
 * Production Test API
 *
 * This endpoint tests all critical production components:
 * - Environment variables
 * - Database connectivity
 * - GREEN-API connection
 * - Optional WhatsApp test message
 */
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get("authorization");
    const apiSecret = process.env.API_SECRET_KEY;

    if (!authHeader || !apiSecret) {
      return NextResponse.json(
        { error: "Missing authorization configuration" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${apiSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { testWhatsApp = false, testPhoneNumber } = body;

    // Simplified test results with any type to avoid strict typing issues
    const testResults: any = {
      timestamp: new Date().toISOString(),
      environment: {
        status: "checking",
        variables: {},
        missing: [],
      },
      database: {
        status: "checking",
        connection: false,
        accountsCount: 0,
        usersCount: 0,
      },
      greenApi: {
        status: "checking",
        connection: false,
        state: null,
        isAuthorized: false,
      },
      whatsapp: {
        status: testWhatsApp ? "checking" : "skipped",
        sent: false,
        messageId: null,
        error: null,
      },
      overall: {
        status: "checking",
        ready: false,
        issues: [],
      },
    };

    // 1. Check Environment Variables
    console.log("🔍 Checking environment variables...");

    const requiredEnvVars = [
      "DATABASE_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "GREEN_API_ID_INSTANCE",
      "GREEN_API_ACCESS_TOKEN",
      "API_SECRET_KEY",
    ];

    const envStatus: Record<string, boolean> = {};

    requiredEnvVars.forEach((varName) => {
      const value = process.env[varName];
      const isPresent = !!value;
      envStatus[varName] = isPresent;

      if (!isPresent) {
        testResults.environment.missing.push(varName);
      }
    });

    testResults.environment.variables = envStatus;
    testResults.environment.status =
      testResults.environment.missing.length === 0 ? "✅ passed" : "❌ failed";

    // 2. Test Database Connection
    console.log("🔍 Testing database connection...");

    try {
      const supabase = createServiceClient();

      // Test accounts table
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("id")
        .limit(1);

      if (accountsError) {
        throw new Error(`Accounts table error: ${accountsError.message}`);
      }

      // Get accounts count
      const { count: accountsCount } = await supabase
        .from("accounts")
        .select("*", { count: "exact", head: true });

      // Test users table
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id")
        .limit(1);

      if (usersError) {
        throw new Error(`Users table error: ${usersError.message}`);
      }

      // Get users count
      const { count: usersCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      testResults.database.connection = true;
      testResults.database.accountsCount = accountsCount || 0;
      testResults.database.usersCount = usersCount || 0;
      testResults.database.status = "✅ passed";

      console.log(
        `✅ Database connected: ${accountsCount} accounts, ${usersCount} users`
      );
    } catch (error) {
      testResults.database.status = `❌ failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      testResults.overall.issues.push(
        `Database: ${error instanceof Error ? error.message : "Connection failed"}`
      );
      console.error("❌ Database connection failed:", error);
    }

    // 3. Test GREEN-API Connection
    console.log("🔍 Testing GREEN-API connection...");

    try {
      const greenApiResult = await validateGreenApiConnection();

      if (greenApiResult.success) {
        testResults.greenApi.connection = true;
        testResults.greenApi.state = greenApiResult.state || null;
        testResults.greenApi.isAuthorized =
          greenApiResult.isAuthorized || false;
        testResults.greenApi.status = greenApiResult.isAuthorized
          ? "✅ passed (authorized)"
          : "⚠️ connected but not authorized";

        if (!greenApiResult.isAuthorized) {
          testResults.overall.issues.push(
            "GREEN-API: WhatsApp not authorized (scan QR code)"
          );
        }

        console.log(
          `✅ GREEN-API connected, state: ${greenApiResult.state}, authorized: ${greenApiResult.isAuthorized}`
        );
      } else {
        testResults.greenApi.status = `❌ failed: ${greenApiResult.error}`;
        testResults.overall.issues.push(`GREEN-API: ${greenApiResult.error}`);
        console.error("❌ GREEN-API connection failed:", greenApiResult.error);
      }
    } catch (error) {
      testResults.greenApi.status = `❌ failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      testResults.overall.issues.push(
        `GREEN-API: ${error instanceof Error ? error.message : "Connection failed"}`
      );
      console.error("❌ GREEN-API test failed:", error);
    }

    // 4. Optional WhatsApp Test Message
    if (testWhatsApp && testPhoneNumber) {
      console.log("🔍 Testing WhatsApp message sending...");

      try {
        if (
          !testResults.greenApi.connection ||
          !testResults.greenApi.isAuthorized
        ) {
          throw new Error("GREEN-API not authorized for sending messages");
        }

        // Send test message
        const testMessageResult =
          await sendTestWhatsAppMessage(testPhoneNumber);

        if (testMessageResult.success) {
          testResults.whatsapp.sent = true;
          testResults.whatsapp.messageId = testMessageResult.messageId;
          testResults.whatsapp.status = "✅ passed";
          console.log(
            `✅ Test WhatsApp message sent successfully to ${testPhoneNumber}`
          );
        } else {
          testResults.whatsapp.status = `❌ failed: ${testMessageResult.error}`;
          testResults.whatsapp.error = testMessageResult.error;
          testResults.overall.issues.push(
            `WhatsApp: ${testMessageResult.error}`
          );
          console.error(
            "❌ WhatsApp test message failed:",
            testMessageResult.error
          );
        }
      } catch (error) {
        testResults.whatsapp.status = `❌ failed: ${error instanceof Error ? error.message : "Unknown error"}`;
        testResults.whatsapp.error =
          error instanceof Error ? error.message : "Unknown error";
        testResults.overall.issues.push(
          `WhatsApp: ${error instanceof Error ? error.message : "Test failed"}`
        );
        console.error("❌ WhatsApp test failed:", error);
      }
    }

    // 5. Overall Status
    const hasErrors = testResults.overall.issues.length > 0;
    const criticalIssues = testResults.overall.issues.filter(
      (issue: string) =>
        issue.includes("Database:") ||
        issue.includes("GREEN-API:") ||
        testResults.environment.missing.length > 0
    );

    testResults.overall.ready = criticalIssues.length === 0;
    testResults.overall.status = testResults.overall.ready
      ? hasErrors
        ? "⚠️ ready with warnings"
        : "✅ fully ready"
      : "❌ not ready";

    console.log(`🎯 Production test completed: ${testResults.overall.status}`);

    return NextResponse.json({
      message: "Production test completed",
      results: testResults,
      summary: {
        ready: testResults.overall.ready,
        status: testResults.overall.status,
        issuesCount: testResults.overall.issues.length,
        issues: testResults.overall.issues,
      },
    });
  } catch (error) {
    console.error("Production test failed:", error);
    return NextResponse.json(
      {
        error: "Production test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Send a test WhatsApp message
 */
async function sendTestWhatsAppMessage(phoneNumber: string): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const instanceId = process.env.GREEN_API_ID_INSTANCE;
    const accessToken = process.env.GREEN_API_ACCESS_TOKEN;

    if (!instanceId || !accessToken) {
      throw new Error("GREEN-API credentials not configured");
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Create test message
    const testMessage = `🧪 Production Test Message

Hi! This is a test message from your WhatsApp reminder system.

✅ System Status: Online
🕐 Time: ${new Date().toLocaleString("ar-SA", { timeZone: "Africa/Nouakchott" })}
🌍 Server: Production

If you received this message, your WhatsApp integration is working correctly!

---
This is an automated test message.`;

    // Send via GREEN-API
    const response = await fetch(
      `https://api.greenapi.com/waInstance${instanceId}/sendMessage/${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: `${formattedPhone}@c.us`,
          message: testMessage,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GREEN-API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    return { success: true, messageId: result.idMessage };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Format phone number for GREEN-API - Smart country code handling
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digits
  let clean = phoneNumber.replace(/\D/g, "");

  // Common country codes
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
    return clean;
  } else if (clean.length === 8) {
    // Mauritanian local number, add country code 222
    return "222" + clean;
  } else if (clean.length > 10) {
    // Probably international number
    return clean;
  } else {
    // Shorter number, assume it needs Mauritania country code
    return "222" + clean;
  }
}
