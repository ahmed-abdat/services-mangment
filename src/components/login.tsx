"use client";


import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import {
  Account,
  TAccount,
} from "@/lib/validations/account-credentials-validator";
import { toast } from "sonner";
import {  auth } from "@/config/firebase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";import Image from "next/image";
import { useEffect } from "react";
;
// import { addUserToDatabase } from "@/lib/firestore/addUser";

const Page = () => {

  const router = useRouter();

  const dashboardUrl = "/services";

  useEffect(() => {
    const localeUser = localStorage?.getItem("user") ?? "";
    if (localeUser) {
      router.push(`${dashboardUrl}`);
      return;
    }
    router.push(`/`);
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAccount>({
    resolver: zodResolver(Account),
  });
  const [signInWithEmailAndPassword, _ , loading, error] =
    useSignInWithEmailAndPassword(auth);





  const handelLogin = (email: string, password: string) => {
      signInWithEmailAndPassword(email, password).then((userCredentiel) => {
        const user = userCredentiel?.user;  
        if (user) {
          toast.success(" تم تسجيل الدخول بنجاح");
          const userData = {
            email: user?.email,
            uid: user?.uid,
          }
          localStorage.setItem("user", JSON.stringify(userData));
          router.push("/services");
        } else  {
          toast.error(" الإيميل أو كلمة السر غير صحيحة");
        }
      }).catch((error) => {
        console.log("error", error);
      }); 

  };

  const onSubmit = ({ email, password }: TAccount) => {
    handelLogin(email, password);
  };

  return (
    <>
      <div className="container min-h-dvh relative flex flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            {/* <Icons.logo className="h-20 w-20" /> */}
            <Image src="/logo.png" alt="logo" width={100} height={100} />
            <h1 className="text-2xl font-semibold tracking-tight font-aljazira">
             تسجيل الدخول
            </h1>

          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <div className="grid gap-1 py-2 ">
                  <Label htmlFor="email" className="font-tajawal text-lg"> الإيميل </Label>
                  <Input
                    type="email"
                    {...register("email")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.email || error,
                    } , "font-roboto text-lg")}
                    placeholder="you@example.com"
                  />

                  {errors?.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1 py-2">
                  <Label htmlFor="password" className="font-tajawal text-lg"> كلمة السر </Label>
                  <Input
                    {...register("password")}
                    type="password"
                    className={cn({
                      "focus-visible:ring-red-500": errors.password || error,
                    }, "font-roboto text-lg")}
                    placeholder="Password"
                  />
                  {errors?.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button className="text-lg ">
                  تسجيل الدخول
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
