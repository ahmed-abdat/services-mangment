import EditServiceForm from "@/features/dashboard/components/services/EditServiceForm";

interface EditServicePageProps {
  params: {
    serviceId: string;
  };
}

export default function EditServicePage({ params }: EditServicePageProps) {
  return (
    <section className="mx-auto sm:flex mt-8 sm:flex-col md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-center">
        Edit Service
      </h1>
      <EditServiceForm serviceId={params.serviceId} />
    </section>
  );
}
