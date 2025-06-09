import { getUser } from "@/app/actions";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  PageBreadcrumb,
  BreadcrumbItem,
} from "@/components/ui/page-breadcrumb";
import { Settings, User, Database } from "lucide-react";

/**
 * Settings Page
 * Shows user account information and system status
 */
export default async function SettingsPage() {
  // Get current user
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Build breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", isCurrentPage: true },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <PageBreadcrumb items={breadcrumbItems} sticky />

      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Account Settings</h1>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
            <CardDescription>
              Your account details and profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={user.full_name || "Not specified"}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={user.email} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Account ID</Label>
              <Input
                value={user.id}
                disabled
                className="bg-muted font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Account Details
            </CardTitle>
            <CardDescription>
              Account creation and activity information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Account Created</Label>
              <Input
                value={
                  user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "Not available"
                }
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Last Updated</Label>
              <Input
                value={
                  user.updated_at
                    ? new Date(user.updated_at).toLocaleDateString()
                    : "Not available"
                }
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Features</CardTitle>
            <CardDescription>
              Currently active features for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between py-2">
                <span>Authentication</span>
                <span className="text-green-600 font-medium">
                  Supabase Auth
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <span>WhatsApp Reminders</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <span>Email Notifications</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
