"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
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
import { toast } from "sonner";
import {
  addAccountUser,
  updateAccountUser,
} from "@/features/dashboard/actions/service-users";
import { useRouter } from "next/navigation";
import UserStartingDate from "@/features/dashboard/components/users/UserStartingDate";
import UserEndingDate from "@/features/dashboard/components/users/UserEndingDate";
import { TUserTable } from "@/types/services/user";
import { TUserData } from "@/features/dashboard/types/dashboard.types";
import {
  UserAccount,
  TUserAccount,
} from "@/features/dashboard/validations/accounts";

interface UserFormProps {
  serviceId: string;
  accountId: string;
  userId?: string;
  serviceName: string;
  accountName: string;
  initialData?: TUserTable | null;
}

/**
 * UserForm Component
 * Client component that handles the user form for adding/editing users in shared accounts
 */
export default function UserForm({
  serviceId,
  accountId,
  userId,
  serviceName,
  accountName,
  initialData,
}: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [startingDate, setStartingDate] = useState<Date>();
  const [endingDate, setEndingDate] = useState<Date>();

  const form = useForm<TUserAccount>({
    resolver: zodResolver(UserAccount),
    mode: "onBlur",
    defaultValues: {
      full_name: "",
      description: "",
      phone_number: "",
    },
  });

  // Helper function to format date without timezone conversion
  const formatDateForStorage = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Initialize form with existing user data when editing
  useEffect(() => {
    if (initialData) {
      // Convert ISO string dates to Date objects for the date pickers
      if (initialData.starting_date && initialData.ending_date) {
        const start = new Date(initialData.starting_date);
        const end = new Date(initialData.ending_date);
        setStartingDate(start);
        setEndingDate(end);
      }

      // Reset form with user data
      const formData = {
        full_name: initialData.full_name,
        description: initialData.description || "",
        phone_number: initialData.phone_number || "",
      };
      form.reset(formData);
    }
  }, [initialData, form]);

  const onSubmit = async (data: TUserAccount) => {
    if (!startingDate || !endingDate) {
      toast.error("Please select starting and ending date");
      return;
    }

    setLoading(true);
    try {
      // Convert Date objects to YYYY-MM-DD format without timezone conversion
      const userData: TUserData = {
        full_name: data.full_name,
        description: data.description || "",
        phone_number: data.phone_number,
        starting_date: formatDateForStorage(startingDate),
        ending_date: formatDateForStorage(endingDate),
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
                <FormDescription>Enter any valid phone number</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-y-4 w-full">
            <UserStartingDate date={startingDate} setDate={setStartingDate} />
            <UserEndingDate
              date={endingDate}
              setDate={setEndingDate}
              startingDate={startingDate}
            />
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
              onClick={() => router.push(`/services/${serviceId}/${accountId}`)}
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
