import { getAccountUsers } from "@/app/action";
import { getServiceAccount } from "@/features/dashboard/actions/service-accounts";
import { getService } from "@/features/dashboard/actions/services";
import NoServicesFound from "@/features/dashboard/components/NoServicesFound";
import UsersHeader from "@/features/dashboard/components/users/UsersHeader";
import UsersTabel from "@/features/dashboard/components/users/UserTabel";
import { formatUserForClient } from "@/lib/utils/format";
import { TUserTable } from "@/types/services/user";
import { ServiceAccount } from "@/types/services/service-accounts";
import { Suspense } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Calendar } from "lucide-react";

import {
  PageBreadcrumb,
  BreadcrumbItem,
} from "@/components/ui/page-breadcrumb";

interface PageProps {
  params: {
    serviceId: string;
    accountId: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

// Loading component for the table
function LoadingTable() {
  return (
    <div className="w-full h-96 flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading users data...</div>
    </div>
  );
}

// Error component
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="w-full p-4 text-center">
      <p className="text-red-500">{message}</p>
    </div>
  );
}

// Personal Account Info Component
function PersonalAccountInfo({ account }: { account: ServiceAccount }) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">
                {account.user_full_name || "Not provided"}
              </p>
            </div>
          </div>

          {account.user_phone_number && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">{account.user_phone_number}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">
                Subscription Start
              </p>
              <p className="font-medium">
                {formatDate(account.account_starting_date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Subscription End</p>
              <p className="font-medium">
                {formatDate(account.account_ending_date)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ServiceAccountPage({
  params,
  searchParams,
}: PageProps) {
  const { serviceId, accountId } = params;

  try {
    // Fetch service details first for breadcrumbs
    const serviceResponse = await getService(serviceId);
    const serviceName =
      serviceResponse.success && serviceResponse.service
        ? serviceResponse.service.name
        : "Unknown Service";

    // Fetch account details
    const accountResponse = await getServiceAccount(serviceId, accountId);

    if (!accountResponse.success || !accountResponse.account) {
      return <ErrorDisplay message="Error loading account details" />;
    }

    const account = accountResponse.account;

    // Build breadcrumbs
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: "Services", href: "/services" },
      { label: serviceName, href: `/services/${serviceId}` },
      { label: account.name, isCurrentPage: true },
    ];

    // Handle personal accounts (show user info directly from account)
    if (account.account_type === "personal") {
      return (
        <div className="space-y-8">
          {/* Breadcrumbs */}
          <PageBreadcrumb items={breadcrumbItems} />

          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {account.name} Account
            </h1>
            <p className="text-muted-foreground">
              View your personal account information.
            </p>
          </div>

          <Suspense fallback={<div>Loading header...</div>}>
            <UsersHeader
              serviceId={serviceId}
              accountId={accountId}
              accountName={account.name}
              accountType="personal"
            />
          </Suspense>

          <PersonalAccountInfo account={account} />
        </div>
      );
    }

    // Handle shared accounts (show users table)
    const usersResponse = await getAccountUsers(serviceId, accountId);

    if (!usersResponse.success || !usersResponse.users) {
      return (
        <div className="space-y-8">
          <PageBreadcrumb items={breadcrumbItems} />
          <ErrorDisplay message="Error loading users" />
        </div>
      );
    }

    // Format users data for client components and ensure no null values
    const formattedUsers = usersResponse.users.map((user: TUserTable) =>
      formatUserForClient(user)
    );

    return (
      <div className="space-y-8">
        {/* Breadcrumbs */}
        <PageBreadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {account.name} Account
          </h1>
          <p className="text-muted-foreground">
            Manage users for this shared account.
          </p>
        </div>

        <Suspense fallback={<div>Loading header...</div>}>
          <UsersHeader
            serviceId={serviceId}
            accountId={accountId}
            accountName={account.name}
            accountType="shared"
          />
        </Suspense>

        <Suspense fallback={<LoadingTable />}>
          {formattedUsers.length === 0 ? (
            <NoServicesFound serviceId={serviceId} accountId={accountId} />
          ) : (
            <UsersTabel users={formattedUsers} params={params} />
          )}
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error in ServiceAccountPage:", error);
    toast.error("An error occurred while loading the page");
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}
