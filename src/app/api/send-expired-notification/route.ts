import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { ExpiredAccountNotification } from "@/emails/ExpiredAccountNotification";
import { createClient } from "@/utils/supabase/server";

// Type definitions for better type safety
interface Service {
  id: string;
  name: string;
}

interface ExpiredAccount {
  id: string;
  name: string;
  email: string;
  expires_at: string;
  account_type: "personal" | "shared";
  user_full_name: string | null;
  user_phone_number: string | null;
  created_at: string;
  service_id: string;
  services: Service;
}

interface User {
  id: string;
  full_name: string | null;
  email: string;
  phone_number: string | null;
}

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * API Route to send expired account notifications
 * This endpoint finds expired accounts and sends email notifications
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify API secret for enhanced security
    // If API_SECRET_KEY is set in environment, require authentication
    if (process.env.API_SECRET_KEY) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
        console.warn("Unauthorized access attempt to expired notification API");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Verify API key is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Verify admin email is configured
    if (!process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "ADMIN_EMAIL is not configured" },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    // Get all expired accounts (expires_at < current date)
    const { data: expiredAccounts, error: accountsError } = await supabase
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
        created_at,
        service_id,
        services!inner (
          id,
          name
        )
      `
      )
      .lt("expires_at", new Date().toISOString())
      .not("expires_at", "is", null) // Only accounts with expiration dates
      .returns<ExpiredAccount[]>();

    if (accountsError) {
      console.error("Error fetching expired accounts:", accountsError);
      return NextResponse.json(
        { error: "Failed to fetch expired accounts" },
        { status: 500 }
      );
    }

    if (!expiredAccounts || expiredAccounts.length === 0) {
      return NextResponse.json(
        { message: "No expired accounts found", count: 0 },
        { status: 200 }
      );
    }

    // Process each expired account
    const emailPromises = expiredAccounts.map(
      async (account: ExpiredAccount) => {
        try {
          // For personal accounts, use account data directly
          if (account.account_type === "personal") {
            const users: User[] = [
              {
                id: account.id,
                full_name: account.user_full_name,
                email: account.email,
                phone_number: account.user_phone_number,
              },
            ];

            return await sendNotificationEmail({
              account,
              users,
              userCount: 1,
            });
          }

          // For shared accounts, fetch all users
          const { data: users, error: usersError } = await supabase
            .from("users")
            .select("id, full_name, email, phone_number")
            .eq("account_id", account.id)
            .returns<User[]>();

          if (usersError) {
            console.error(
              `Error fetching users for account ${account.id}:`,
              usersError
            );
            return { success: false, error: usersError.message };
          }

          return await sendNotificationEmail({
            account,
            users: users || [],
            userCount: users?.length || 0,
          });
        } catch (error) {
          console.error(`Error processing account ${account.id}:`, error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }
    );

    // Wait for all emails to be processed
    const results = await Promise.allSettled(emailPromises);

    // Count successful and failed emails
    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;

    const failed = results.filter(
      (result) =>
        result.status === "rejected" ||
        (result.status === "fulfilled" && !result.value.success)
    ).length;

    // Log results for monitoring
    console.log(
      `Email notification summary: ${successful} sent, ${failed} failed`
    );

    return NextResponse.json({
      message: "Expired account notifications processed",
      total: expiredAccounts.length,
      successful,
      failed,
      expiredAccounts: expiredAccounts.map((acc) => ({
        accountName: acc.name,
        serviceName: acc.services.name,
        expiredDate: acc.expires_at,
      })),
    });
  } catch (error) {
    console.error("Error in send-expired-notification API:", error);
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
 * Helper function to send individual notification emails
 */
async function sendNotificationEmail({
  account,
  users,
  userCount,
}: {
  account: ExpiredAccount;
  users: User[];
  userCount: number;
}) {
  try {
    const dashboardUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000";

    const emailData = await resend.emails.send({
      from: `Services Management <${process.env.RESEND_FROM_EMAIL || "notifications@your-domain.com"}>`,
      to: [process.env.ADMIN_EMAIL!],
      subject: `🚨 Services Management - Account Expired: ${account.name}`,
      react: ExpiredAccountNotification({
        accountName: account.name,
        serviceName: account.services.name,
        expiredDate: account.expires_at,
        accountType: account.account_type,
        userCount,
        users,
        serviceId: account.service_id,
        accountId: account.id,
        dashboardUrl,
      }),
    });

    if (emailData.error) {
      console.error("Resend email error:", emailData.error);
      return { success: false, error: emailData.error };
    }

    console.log(
      `Email sent successfully for account ${account.name}:`,
      emailData.data?.id
    );
    return { success: true, emailId: emailData.data?.id };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
