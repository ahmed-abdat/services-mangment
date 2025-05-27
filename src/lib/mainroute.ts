/**
 * Main application URL configuration
 * Uses NEXT_PUBLIC_APP_URL from environment variables
 * Falls back to localhost for development if not set
 */
export const mainRoute =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
