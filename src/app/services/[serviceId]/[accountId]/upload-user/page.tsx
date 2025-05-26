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
  getAccountUser,
  updateAccountUser,
} from "@/features/dashboard/actions/service-users";
import { getService } from "@/features/dashboard/actions/services";
import { getServiceAccount } from "@/features/dashboard/actions/service-accounts";
import { useRouter } from "next/navigation";
import UserStartingDate from "@/features/dashboard/components/users/UserStartingDate";
import UserEndingDate from "@/features/dashboard/components/users/UserEndingDate";
import { TUserTable } from "@/types/services/user";
import { TUserData } from "@/features/dashboard/types/dashboard.types";

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
  const [serviceName, setServiceName] = React.useState<string>("");
  const [user, setUser] = React.useState<TUserTable | null>(null);
  const [startingDate, setStartingDate] = React.useState<Date>();
  const [endingDate, setEndingDate] = React.useState<Date>();
  const [loading, setLoading] = React.useState<boolean>(false);

  const accountId = params.accountId;
  const serviceId = params.serviceId;
  const userId = searchParams.userId as string;

  const form = useForm<TUserAccount>({
    resolver: zodResolver(UserAccount),
    mode: "onChange",
    defaultValues: {
      full_name: "",
      description: "",
      phone_number: "",
    },
  });

  // get user data for editing (only when userId is provided)
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        return;
      }

      try {
        const { user, success, error } = await getAccountUser(
          serviceId,
          accountId,
          userId
        );

        if (!success || !user) {
          console.error("Failed to load user:", error);
          toast.error(error || "Error loading user data");
          return;
        }

        // Set the user data
        setUser(user);

        // Convert ISO string dates to Date objects for the date pickers
        if (user.starting_date && user.ending_date) {
          const start = new Date(user.starting_date);
          const end = new Date(user.ending_date);
          setStartingDate(start);
          setEndingDate(end);
        }

        // Reset form with user data
        const formData = {
          full_name: user.full_name,
          description: user.description || "",
          phone_number: user.phone_number || "",
        };
        form.reset(formData);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user data");
      }
    };

    fetchUserData();
  }, [userId, serviceId, accountId, form]);

  const onSubmit = async (data: TUserAccount) => {
    if (!startingDate || !endingDate) {
      toast.error("Please select starting and ending date");
      return;
    }

    setLoading(true);
    try {
      // Convert Date objects to ISO strings for the server action
      const userData: TUserData = {
        full_name: data.full_name,
        description: data.description || "",
        phone_number: data.phone_number,
        starting_date: startingDate.toISOString(),
        ending_date: endingDate.toISOString(),
      };

      if (userId) {
        // Update existing user
        const { success, error } = await updateAccountUser(
          serviceId,
          accountId,
          userId,
          userData
        );

        if (success) {
          toast.success("User updated successfully");
          router.push(`/services/${serviceId}/${accountId}`);
        } else {
          toast.error(error || "Error updating user");
        }
      } else {
        // Create new user
        const { success, error } = await addAccountUser(
          serviceId,
          accountId,
          userData
        );

        if (success) {
          toast.success("User added successfully");
          router.push(`/services/${serviceId}/${accountId}`);
        } else {
          toast.error(error || "Error adding user");
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
    } finally {
      setLoading(false);
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

  return (
    <section className="mx-auto sm:flex mt-8 sm:flex-col md:px-8">
      <h1 className="text-2xl tracking-tight text-center">
        {userId ? "Update" : "Create new"} user for{" "}
        <span className="font-semibold">{accountName}</span> in{" "}
        <span className="font-semibold">{serviceName}</span> service
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormDescription>
                  This is the name that will be displayed for the user.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Format: 42049074</FormDescription>
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add a description (optional)"
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
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full mx-auto md:max-w-full text-lg"
              disabled={loading}
            >
              {userId ? "Update User" : "Create User"}
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
