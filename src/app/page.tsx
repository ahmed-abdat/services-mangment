import { redirect } from "next/navigation";
import { getUser } from "./actions";

export default async function Home() {
  const user = await getUser();
  if (user) {
    redirect("/services");
  }
  redirect("/login");
}
