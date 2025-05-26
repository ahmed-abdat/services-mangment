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
  TAccountsService,
  AccountsService,
} from "@/lib/validations/service-accounts/accounts-services";
import { toast } from "sonner";
import {
  addServiceAccount,
  checkIfAccountNameExists,
  getServiceAccount,
  getServiceAccounts,
  updateServiceAccount,
} from "@/features/dashboard/actions/service-accounts";
import { getService } from "@/features/dashboard/actions/services";
import { useRouter } from "next/navigation";
import { ServiceAccount } from "@/types/services/service-accounts";

export default function UploadAccounts({
  params,
  searchParams,
}: {
  params: { serviceId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const router = useRouter();

  const [serviceName, setServiceName] = React.useState<string>("");
  const accountId = searchParams?.accountId as string;
  const form = useForm<TAccountsService>({
    resolver: zodResolver(AccountsService),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      details: "",
    },
  });

  // get the service name and account details
  useEffect(() => {
    const fetchServiceName = async () => {
      const { service, success } = await getService(params.serviceId);
      if (!success || !service) {
        return;
      }
      setServiceName(service.name);
    };

    const fechAccountDetails = async () => {
      if (!accountId) return;
      const { account, success } = await getServiceAccount(
        params.serviceId,
        accountId
      );
      if (!success || !account) {
        return;
      }
      form.setValue("name", account.name || "");
      form.setValue("email", account.email || "");
      form.setValue("details", account.details || "");
    };

    fetchServiceName();
    fechAccountDetails();
  }, [params.serviceId, accountId, form]);

  const [loading, setLoading] = React.useState<boolean>(false);

  const onSubmit = async (data: TAccountsService) => {
    try {
      setLoading(true);

      // Check if account name exists
      const { success: isNameExiste } = await checkIfAccountNameExists(
        params.serviceId,
        data.name.trim()
      );
      if (isNameExiste && !accountId) {
        toast.error("Account name already exists");
        form.setFocus("name");
        setLoading(false);
        return;
      }

      // Check if email exists in any account
      const { accounts } = await getServiceAccounts(params.serviceId);
      const emailExists = accounts.some(
        (account: ServiceAccount) =>
          account.email === data.email && account.id !== accountId
      );
      if (emailExists) {
        toast.error("Email already exists in another account");
        form.setFocus("email");
        setLoading(false);
        return;
      }

      // check if we are updating the account
      if (accountId) {
        const { success } = await updateServiceAccount(
          params.serviceId,
          accountId,
          data
        );
        if (success) {
          toast.success("Account updated successfully");
          form.reset();
          router.push(`/services/${params.serviceId}`);
        } else {
          toast.error("Error while updating account");
        }
        setLoading(false);
        return;
      }

      const { success } = await addServiceAccount(params.serviceId, data);

      if (success) {
        toast.success("New account created successfully");
        form.reset();
        router.push(`/services/${params.serviceId}`);
      } else {
        toast.error("Error while creating new account");
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Error while creating new account");
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto sm:flex mt-8 sm:flex-col md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-center">
        {accountId ? "Update" : "Create New"} {serviceName} Service Account
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter account name" {...field} />
                </FormControl>
                <FormDescription>Account name must be unique</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter account email"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Each account must have a unique email
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Details</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter account details"
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
              onClick={() => router.push(`/services/${params.serviceId}`)}
              className="w-full mx-auto md:max-w-full text-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full mx-auto md:max-w-full text-lg"
              disabled={loading}
            >
              {accountId ? "Update Account" : "Create Account"}
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
