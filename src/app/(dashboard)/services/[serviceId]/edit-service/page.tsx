import EditServiceForm from "@/features/dashboard/components/services/EditServiceForm";
import {
  PageBreadcrumb,
  BreadcrumbItem,
} from "@/components/ui/page-breadcrumb";
import { getService } from "@/features/dashboard/actions/services";

interface EditServicePageProps {
  params: Promise<{
    serviceId: string;
  }>;
}

export default async function EditServicePage({
  params,
}: EditServicePageProps) {
  // Await params according to Next.js 15 async request APIs
  const { serviceId } = await params;

  // Get service name for breadcrumbs
  const serviceResult = await getService(serviceId);
  const serviceName =
    serviceResult.success && serviceResult.service
      ? serviceResult.service.name
      : "Unknown Service";

  // Build breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Services", href: "/services" },
    { label: serviceName, href: `/services/${serviceId}` },
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

      <EditServiceForm serviceId={serviceId} />
    </div>
  );
}
