import { DashboardStats, RecentActivity } from "@/features/dashboard";
import { getDashboardStats } from "@/features/dashboard/actions/dashboard-stats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Plus,
  Settings,
  FileText,
  Users,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

/**
 * Dashboard Page
 * Main dashboard showing stats, insights, and recent activity
 */
export default async function DashboardPage() {
  // Fetch dashboard stats on server
  const statsResult = await getDashboardStats();
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your services.
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Alerts Section */}
      {stats && stats.expiringSoonUsers > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You have{" "}
            <strong>
              {stats.expiringSoonUsers} subscription
              {stats.expiringSoonUsers > 1 ? "s" : ""}
            </strong>{" "}
            expiring soon.
            <Link
              href="/services"
              className="underline ml-1 hover:text-orange-900"
            >
              View services
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {stats && stats.expiredUsers > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You have{" "}
            <strong>
              {stats.expiredUsers} expired subscription
              {stats.expiredUsers > 1 ? "s" : ""}
            </strong>{" "}
            that need attention.
            <Link
              href="/services"
              className="underline ml-1 hover:text-red-900"
            >
              Review expired accounts
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="md:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/services/new-service">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create New Service
              </Button>
            </Link>

            <Link href="/services">
              <Button className="w-full justify-start" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Services
              </Button>
            </Link>

            <Link href="/services">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>

            <Link href="/settings">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Service Overview & Insights */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Service Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Service Insights
              </CardTitle>
              <CardDescription>
                Summary of your subscription management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalServices}
                  </div>
                  <p className="text-sm text-muted-foreground">Services</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalAccounts}
                  </div>
                  <p className="text-sm text-muted-foreground">Accounts</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active Users</span>
                  <span className="font-medium text-green-600">
                    {stats.activeUsers}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expiring Soon</span>
                  <span className="font-medium text-orange-600">
                    {stats.expiringSoonUsers}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expired</span>
                  <span className="font-medium text-red-600">
                    {stats.expiredUsers}
                  </span>
                </div>
              </div>

              {stats.totalUsers > 0 && (
                <div className="pt-4 border-t">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Active Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round((stats.activeUsers / stats.totalUsers) * 100)}
                      %
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                System Status
              </CardTitle>
              <CardDescription>
                Current system features and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">WhatsApp Reminders</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Notifications</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Authentication</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Supabase
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  All systems operational
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Data State */}
      {(!stats || stats.totalServices === 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Get Started</CardTitle>
            <CardDescription>
              Create your first service to start managing subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                No services found. Create your first service to get started.
              </p>
              <Link href="/services/new-service">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Service
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
