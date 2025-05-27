import CreateServiceForm from "@/features/dashboard/components/services/CreateServiceForm";

export default function CreateServicePage() {
  return (
    <section className="mx-auto sm:flex mt-8 sm:flex-col md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-center">
        Create New Service
      </h1>
      <CreateServiceForm />
    </section>
  );
}
