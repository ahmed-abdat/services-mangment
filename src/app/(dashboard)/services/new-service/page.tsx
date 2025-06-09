import CreateServiceForm from "@/features/dashboard/components/services/CreateServiceForm";
import {
  PageBreadcrumb,
  BreadcrumbItem,
} from "@/components/ui/page-breadcrumb";

export default function CreateServicePage() {
  // Build breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Services", href: "/services" },
    { label: "New Service", isCurrentPage: true },
  ];

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <PageBreadcrumb items={breadcrumbItems} sticky />

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Service
        </h1>
        <p className="text-muted-foreground">
          Add a new service to your dashboard and start managing accounts.
        </p>
      </div>
      <CreateServiceForm />
    </div>
  );
}
