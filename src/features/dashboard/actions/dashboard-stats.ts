"use server";

import { createClient } from "@/utils/supabase/server";

export interface DashboardStats {
  totalServices: number;
  totalAccounts: number;
  totalUsers: number;
  activeUsers: number;
  expiredUsers: number;
  expiringSoonUsers: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type:
    | "service_created"
    | "account_added"
    | "user_added"
    | "subscription_expiring"
    | "subscription_expired";
  message: string;
  time: string;
  status: "success" | "warning" | "error" | "info";
  metadata?: {
    serviceName?: string;
    accountName?: string;
    userName?: string;
  };
}

/**
 * Get comprehensive dashboard statistics from the database
 */
export async function getDashboardStats(): Promise<{
  success: boolean;
  data?: DashboardStats;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get total services count
    const { count: servicesCount, error: servicesError } = await supabase
      .from("services")
      .select("*", { count: "exact", head: true });

    if (servicesError) {
      console.error("Error fetching services count:", servicesError);
      return { success: false, error: servicesError.message };
    }

    // Get total accounts count
    const { count: accountsCount, error: accountsError } = await supabase
      .from("accounts")
      .select("*", { count: "exact", head: true });

    if (accountsError) {
      console.error("Error fetching accounts count:", accountsError);
      return { success: false, error: accountsError.message };
    }

    // Get users statistics
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("ending_date");

    if (usersError) {
      console.error("Error fetching users data:", usersError);
      return { success: false, error: usersError.message };
    }

    // Get personal accounts statistics
    const { data: personalAccounts, error: personalError } = await supabase
      .from("accounts")
      .select("account_ending_date, account_type")
      .eq("account_type", "personal")
      .not("account_ending_date", "is", null);

    if (personalError) {
      console.error("Error fetching personal accounts:", personalError);
      return { success: false, error: personalError.message };
    }

    // Calculate user statistics
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    let totalUsers = 0;
    let activeUsers = 0;
    let expiredUsers = 0;
    let expiringSoonUsers = 0;

    // Process shared account users
    if (usersData) {
      totalUsers += usersData.length;

      usersData.forEach((user) => {
        const endingDate = new Date(user.ending_date);

        if (endingDate < today) {
          expiredUsers++;
        } else {
          activeUsers++;

          if (endingDate <= sevenDaysFromNow) {
            expiringSoonUsers++;
          }
        }
      });
    }

    // Process personal account users
    if (personalAccounts) {
      totalUsers += personalAccounts.length;

      personalAccounts.forEach((account) => {
        const endingDate = new Date(account.account_ending_date!);

        if (endingDate < today) {
          expiredUsers++;
        } else {
          activeUsers++;

          if (endingDate <= sevenDaysFromNow) {
            expiringSoonUsers++;
          }
        }
      });
    }

    // Get recent activity
    const recentActivity = await getRecentActivity();

    const stats: DashboardStats = {
      totalServices: servicesCount || 0,
      totalAccounts: accountsCount || 0,
      totalUsers,
      activeUsers,
      expiredUsers,
      expiringSoonUsers,
      recentActivity: recentActivity.data || [],
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard statistics" };
  }
}

/**
 * Get recent activity from the database
 */
export async function getRecentActivity(): Promise<{
  success: boolean;
  data?: ActivityItem[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const activities: ActivityItem[] = [];

    // Get recent services (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentServices, error: servicesError } = await supabase
      .from("services")
      .select("id, name, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(5);

    if (servicesError) {
      console.error("Error fetching recent services:", servicesError);
    } else if (recentServices) {
      recentServices.forEach((service) => {
        activities.push({
          id: `service-${service.id}`,
          type: "service_created",
          message: `Service '${service.name}' created`,
          time: new Date(service.created_at).toLocaleDateString(),
          status: "success",
          metadata: { serviceName: service.name },
        });
      });
    }

    // Get recent accounts (last 30 days)
    const { data: recentAccounts, error: accountsError } = await supabase
      .from("accounts")
      .select(
        `
        id, name, created_at,
        services (name)
      `
      )
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(5);

    if (accountsError) {
      console.error("Error fetching recent accounts:", accountsError);
    } else if (recentAccounts) {
      recentAccounts.forEach((account) => {
        activities.push({
          id: `account-${account.id}`,
          type: "account_added",
          message: `Account '${account.name}' added to ${(account.services as any)?.name || "service"}`,
          time: new Date(account.created_at!).toLocaleDateString(),
          status: "info",
          metadata: {
            accountName: account.name,
            serviceName: (account.services as any)?.name,
          },
        });
      });
    }

    // Get recent users (last 30 days)
    const { data: recentUsers, error: usersError } = await supabase
      .from("users")
      .select(
        `
        id, full_name, created_at, ending_date,
        accounts (name, services (name))
      `
      )
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(5);

    if (usersError) {
      console.error("Error fetching recent users:", usersError);
    } else if (recentUsers) {
      recentUsers.forEach((user) => {
        activities.push({
          id: `user-${user.id}`,
          type: "user_added",
          message: `User '${user.full_name}' added to ${(user.accounts as any)?.name || "account"}`,
          time: new Date(user.created_at!).toLocaleDateString(),
          status: "success",
          metadata: {
            userName: user.full_name,
            accountName: (user.accounts as any)?.name,
            serviceName: (user.accounts as any)?.services?.name,
          },
        });
      });
    }

    // Get expiring subscriptions
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: expiringSoon, error: expiringError } = await supabase
      .from("users")
      .select(
        `
        id, full_name, ending_date,
        accounts (name, services (name))
      `
      )
      .gte("ending_date", new Date().toISOString().split("T")[0])
      .lte("ending_date", sevenDaysFromNow.toISOString().split("T")[0])
      .order("ending_date", { ascending: true })
      .limit(3);

    if (expiringError) {
      console.error("Error fetching expiring subscriptions:", expiringError);
    } else if (expiringSoon && expiringSoon.length > 0) {
      activities.push({
        id: "expiring-soon",
        type: "subscription_expiring",
        message: `${expiringSoon.length} subscription${expiringSoon.length > 1 ? "s" : ""} expiring soon`,
        time: "Today",
        status: "warning",
        metadata: {},
      });
    }

    // Sort activities by most recent first
    activities.sort((a, b) => {
      if (a.time === "Today") return -1;
      if (b.time === "Today") return 1;
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

    return { success: true, data: activities.slice(0, 10) }; // Limit to 10 items
  } catch (error) {
    console.error("Error getting recent activity:", error);
    return { success: false, error: "Failed to fetch recent activity" };
  }
}
