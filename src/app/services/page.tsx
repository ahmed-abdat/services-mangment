
import NoServicesFound from "@/components/dashboard/NoServicesFound";
import ServiceHeader from "@/components/dashboard/ServiceHeader";
import { getServices } from "@/app/actions/services";
import ServiceCard from "@/components/dashboard/ServiceCard";
import { DeleteModal } from "@/components/dashboard/DeleteModel";

export default async function Services({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { services , success} = await getServices();

  

  if(success === false){
    return <div className="text-center w-full mt-8">
      <h1>services has some error will loading</h1>
    </div>
  }

 
  return (
    <>
      <DeleteModal searchParams={searchParams} />
      <ServiceHeader />
      {
        services.length === 0 ? (
          <NoServicesFound />
        ) :  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-4">
        {services.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
      }
    </>
  );
}
