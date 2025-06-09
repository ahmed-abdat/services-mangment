import NoServicesFound from "@/features/dashboard/components/NoServicesFound";
import ServiceHeader from "@/features/dashboard/components/ServiceHeader";
import { getServices } from "@/features/dashboard/actions/services";
import ServiceCard from "@/features/dashboard/components/ServiceCard";
import CardGrid from "@/components/card-grid";

interface ServicesPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function Services({ searchParams }: ServicesPageProps) {
  // Await searchParams according to Next.js 15 async request APIs
  const resolvedSearchParams = await searchParams;
  const { services, success } = await getServices();

  if (success === false) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-destructive">
            Error Loading Services
          </h1>
          <p className="text-muted-foreground">
            There was an error loading your services. Please try again.
          </p>
        </div>
      </div>
    );
  }

  // Filter services based on search parameter
  const searchTerm = resolvedSearchParams.search?.toLowerCase().trim();
  const filteredServices = searchTerm
    ? services.filter((service) =>
        service.name.toLowerCase().includes(searchTerm)
      )
    : services;

  return (
    <div className="space-y-8">
      <ServiceHeader />
      {services.length === 0 ? (
        <NoServicesFound />
      ) : filteredServices.length === 0 && searchTerm ? (
        // No search results
        <div className="text-center py-12">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">No services found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No services match your search for &quot;
              {resolvedSearchParams.search}
              &quot;. Try a different search term or create a new service.
            </p>
          </div>
        </div>
      ) : (
        <CardGrid>
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </CardGrid>
      )}
    </div>
  );
}
