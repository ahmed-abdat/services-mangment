import { getService } from "@/features/dashboard/actions/services";
import { getServiceAccount } from "@/features/dashboard/actions/service-accounts";
import { getAccountUser } from "@/features/dashboard/actions/service-users";
import UserForm from "@/features/dashboard/components/users/UserForm";
import { TUserTable } from "@/types/services/user";
import {
  PageBreadcrumb,
  BreadcrumbItem,
} from "@/components/ui/page-breadcrumb";

/**
 * Add/Edit User Page
 * Server component that fetches required data and renders the UserForm component
 */

interface AddUserPageProps {
  params: Promise<{ serviceId: string; accountId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AddUserPage({
  params,
  searchParams,
}: AddUserPageProps) {
  // Await params and searchParams according to Next.js 15 async request APIs
  const { serviceId, accountId } = await params;
  const resolvedSearchParams = await searchParams;
  const userId = resolvedSearchParams?.userId as string;

  // Fetch service name on the server
  const { service, success: serviceSuccess } = await getService(serviceId);
  const serviceName = serviceSuccess && service ? service.name : "";

  // Fetch account name on the server
  const { account, success: accountSuccess } = await getServiceAccount(
    serviceId,
    accountId
  );
  const accountName = accountSuccess && account ? account.name : "";

  // Build breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Services", href: "/services" },
    { label: serviceName, href: `/services/${serviceId}` },
    { label: accountName, href: `/services/${serviceId}/${accountId}` },
    { label: userId ? "Edit User" : "Add User", isCurrentPage: true },
  ];

  // Fetch user data if editing (server-side)
  // Let Supabase handle UUID validation naturally
  let userData: TUserTable | null = null;

  if (userId && typeof userId === "string") {
    try {
      const { user, success: userSuccess } = await getAccountUser(
        serviceId,
        accountId,
        userId
      );
      if (userSuccess && user) {
        userData = user;
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      // Continue without user data for graceful degradation
    }
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <PageBreadcrumb items={breadcrumbItems} sticky />

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {userId ? "Edit User" : "Add New User"}
        </h1>
        <p className="text-muted-foreground">
          {userId
            ? "Update user information and subscription details."
            : `Add a new user to ${accountName} account in ${serviceName} service.`}
        </p>
      </div>

      <UserForm
        serviceId={serviceId}
        accountId={accountId}
        userId={userId}
        serviceName={serviceName}
        accountName={accountName}
        initialData={userData}
      />
    </div>
  );
}
