import NoServicesFound from "@/features/dashboard/components/NoServicesFound";
import ServiceHeader from "@/features/dashboard/components/ServiceHeader";
import { getServices } from "@/features/dashboard/actions/services";
import ServiceCard from "@/features/dashboard/components/ServiceCard";
import { DeleteModal } from "@/features/dashboard/components/DeleteModel";
import CardGrid from "@/components/card-grid";

export default async function Services({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { services, success } = await getServices();

  if (success === false) {
    return (
      <div className="text-center w-full mt-8">
        <h1>services has some error will loading</h1>
      </div>
    );
  }

  return (
    <>
      <DeleteModal searchParams={searchParams} />
      <ServiceHeader />
      {services.length === 0 ? (
        <NoServicesFound />
      ) : (
        <div className="mt-6">
          <CardGrid>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </CardGrid>
        </div>
      )}
    </>
  );
}
