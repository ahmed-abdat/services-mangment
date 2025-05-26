import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Force dynamic rendering for the route handler
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";
  const type = requestUrl.searchParams.get("type");

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?error=No code provided`, request.url)
    );
  }

  try {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        new URL(`/login?error=${error.message}`, request.url)
      );
    }

    // If this is email verification, check for returnTo and redirect
    if (type === "email_verification") {
      // If returnTo is provided, use it for the redirect
      if (data?.user) {
        try {
          // Clean up the returnTo from user metadata
          const { error: updateError } = await supabase.auth.updateUser({
            data: { returnTo: null },
          });
          if (updateError) {
            console.error("Failed to clear returnTo metadata:", updateError);
          }
        } catch (updateErr) {
          console.error("Error updating user metadata:", updateErr);
        }
      }

      return NextResponse.redirect(
        new URL(`${next}?verified=true`, request.url)
      );
    }

    // For other auth callbacks (like OAuth), redirect to the next URL
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    console.error("Unknown error in auth callback:", error);
    return NextResponse.redirect(
      new URL(`/login?error=Unknown error occurred`, request.url)
    );
  }
}
