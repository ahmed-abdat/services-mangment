"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  TUserAccount,
  UserAccount,
} from "@/lib/validations/service-accounts/user-account";
import { toast } from "sonner";
import {
  addAccountUser,
  addServiceAccount,
  getAccountUser,
  getAccountUsers,
  getService,
  getServiceAccount,
  updateAccountUser,
  updateServiceAccount,
} from "@/app/action";
import { useRouter } from "next/navigation";
import UserStartingDate from "@/components/dashboard/users/UserStartingDate";
import UserEndingDate from "@/components/dashboard/users/UserEndingDate";
import { TUserData, TUserTabel } from "@/types/services/user";

export default function UploadAccounts({
  params,
  searchParams,
}: {
  params: { serviceId: string; accountId: string };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}) {
  const router = useRouter();

  const [accountName, setAccountName] = React.useState<string>("");
  const [serciceName, setServiceName] = React.useState<string>("");
  const [user, setUser] = React.useState<TUserTabel | null>(null);
  // const [value, setOnValueChange] = React.useState<string>("");
  const [startingDate, setStartingDate] = React.useState<Date>();
  const [endingDate, setEndingDate] = React.useState<Date>();
  const accountId = params.accountId;
  const serviceId = params.serviceId;
  const userId = searchParams.userId as string;
  const form = useForm<TUserAccount>({
    resolver: zodResolver(UserAccount),
    mode: "onChange",
  });

  const [loading, setLoading] = React.useState<boolean>(false);

  const onSubmit = async (data: TUserAccount) => {
    if (!startingDate || !endingDate) {
      toast.error("please select starting and ending date");
      return;
    }
    const userData: TUserData = {
      ...data,
      startingDate: startingDate,
      endingDate: endingDate,
      description: data.description || "",
    };

    setLoading(true);
    try {
      // check if we are updating or creating new account
      if (userId) {
        const { success } = await updateAccountUser(
          serviceId,
          accountId,
          userId,
          userData
        );
        if (success) {
          toast.success("user updated successfully");
          router.push(`/services/${serviceId}/${accountId}`);
        } else {
          toast.error("error updating user");
        }
        return;
      }

      if (!accountId || !serviceId) return;
      const { success } = await addAccountUser(serviceId, accountId, userData);

      if (success) {
        toast.success("user added successfully");
        router.push(`/services/${serviceId}/${accountId}`);
      } else {
        toast.error("error adding user");
      }
    } catch (error) {
      console.log(error);
      toast.error("error adding user");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    const fetchAccountName = async () => {
      if (!accountId) return;
      const { account, success } = await getServiceAccount(
        params.serviceId,
        accountId
      );
      if (!success || !account) {
        return;
      }
      setAccountName(account.name);
    };

    const fetchServiceName = async () => {
      const { service, success } = await getService(params.serviceId);
      if (!success || !service) {
        return;
      }
      setServiceName(service.name);
    };
    fetchServiceName();
    fetchAccountName();
  }, [params.accountId, params.serviceId, accountId]);

  // get user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      const { user, success } = await getAccountUser(
        serviceId,
        accountId,
        userId
      );
      if (!success || !user) {
        return;
      }
      setUser(user);
      setStartingDate(user.startingDate.toDate());
      setEndingDate(user.endingDate.toDate());
      form.setValue("email", user.email);
      form.setValue("description", user.description);
    };
    fetchUserData();
  }, [userId, serviceId, accountId, form]);

  return (
    <section className="mx-auto sm:flex mt-8 sm:flex-col md:px-8">
      <h1 className="text-2xl  tracking-tight text-center">
        Create new user for <span className="font-semibold">{accountName}</span>{" "}
        in <span className="font-semibold">{serciceName}</span> service
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>email </FormLabel>
                <FormControl>
                  <Input placeholder="your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-y-4 w-full">
            <UserStartingDate date={startingDate} setDate={setStartingDate} />
            <UserEndingDate date={endingDate} setDate={setEndingDate} />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel> description </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="your description here"
                    className="resize-none min-h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between gap-x-4 w-full">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(`/services/${params.serviceId}/${params.accountId}`)
              }
              className="w-full mx-auto md:max-w-full text-lg"
            >
              cancel
            </Button>
            <Button
              type="submit"
              className="w-full mx-auto md:max-w-full text-lg"
              disabled={loading}
            >
              {userId ? "update account" : "create new account"}
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
