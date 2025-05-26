"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Get the number of accounts for a specific service
 * @param serviceId - The ID of the service
 * @returns Promise<number> - Number of accounts
 */
export async function getServiceAccountCount(
  serviceId: string
): Promise<number> {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("accounts")
      .select("*", { count: "exact", head: true })
      .eq("service_id", serviceId);

    if (error) {
      console.error("Error fetching account count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getServiceAccountCount:", error);
    return 0;
  }
}

/**
 * Get service details with account count
 * @param serviceId - The ID of the service
 * @returns Promise<{service: any, accountCount: number}> - Service with account count
 */
export async function getServiceWithAccountCount(serviceId: string) {
  try {
    const supabase = await createClient();

    // Get service details and account count in parallel
    const [serviceResult, accountCount] = await Promise.all([
      supabase.from("services").select("*").eq("id", serviceId).single(),
      getServiceAccountCount(serviceId),
    ]);

    if (serviceResult.error) {
      console.error("Error fetching service:", serviceResult.error);
      return { service: null, accountCount: 0 };
    }

    return {
      service: serviceResult.data,
      accountCount,
    };
  } catch (error) {
    console.error("Error in getServiceWithAccountCount:", error);
    return { service: null, accountCount: 0 };
  }
}
