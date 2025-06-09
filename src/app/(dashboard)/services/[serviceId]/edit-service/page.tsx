import EditServiceForm from "@/features/dashboard/components/services/EditServiceForm";
import {
  PageBreadcrumb,
  BreadcrumbItem,
} from "@/components/ui/page-breadcrumb";
import { getService } from "@/features/dashboard/actions/services";

interface EditServicePageProps {
  params: {
    serviceId: string;
  };
}

export default async function EditServicePage({
  params,
}: EditServicePageProps) {
  // Get service name for breadcrumbs
  const serviceResult = await getService(params.serviceId);
  const serviceName =
    serviceResult.success && serviceResult.service
      ? serviceResult.service.name
      : "Unknown Service";

  // Build breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Services", href: "/services" },
    { label: serviceName, href: `/services/${params.serviceId}` },
    { label: "Edit", isCurrentPage: true },
  ];

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <PageBreadcrumb items={breadcrumbItems} sticky />

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit Service</h1>
        <p className="text-muted-foreground">
          Update your service information and settings.
        </p>
      </div>

      <EditServiceForm serviceId={params.serviceId} />
    </div>
  );
}
