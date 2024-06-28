
import UploadServiceForm from "@/components/dashboard/services/UploadServiceForm";


export default function page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {

  const id =  searchParams?.serviceName;

    

  return (
    <section className="mx-auto sm:flex mt-8 sm:flex-col md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-center">
        Creat New Service
      </h1>
      <UploadServiceForm name={id} />
    </section>
  );
}
