"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ServiceAccount } from "@/types/services/service-accounts";
import {
  addServiceAccount,
  checkIfAccountNameExists,
  getServiceAccounts,
  updateServiceAccount,
} from "../../actions/service-accounts";
import { TAccountsService, AccountsService } from "../../validations/accounts";
import AccountDatePicker from "./AccountDatePicker";

interface AccountFormProps {
  serviceId: string;
  serviceName: string;
  accountId?: string;
  initialData?: ServiceAccount;
  fetchError?: string | null;
}

export default function AccountForm({
  serviceId,
  serviceName,
  accountId,
  initialData,
  fetchError,
}: AccountFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  // Date state for the dedicated date components
  const [accountStartingDate, setAccountStartingDate] = useState<Date>();
  const [accountEndingDate, setAccountEndingDate] = useState<Date>();
  const [expirationDate, setExpirationDate] = useState<Date>();

  const form = useForm<TAccountsService>({
    resolver: zodResolver(AccountsService),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      details: "",
      expires_at: null,
      account_type: "shared",
      user_full_name: null,
      user_phone_number: null,
      account_starting_date: null,
      account_ending_date: null,
    },
  });

  // Watch account type to show/hide personal user fields
  const accountType = form.watch("account_type");

  // Helper function to format date for storage (YYYY-MM-DD)
  const formatDateForStorage = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      form.setValue("name", initialData.name || "");
      form.setValue("email", initialData.email || "");
      form.setValue("details", initialData.details || "");
      form.setValue("expires_at", initialData.expires_at || null);
      form.setValue("account_type", initialData.account_type || "shared");
      form.setValue("user_full_name", initialData.user_full_name || null);
      form.setValue("user_phone_number", initialData.user_phone_number || null);
      form.setValue(
        "account_starting_date",
        initialData.account_starting_date || null
      );
      form.setValue(
        "account_ending_date",
        initialData.account_ending_date || null
      );

      // Initialize date states for the date picker components
      if (initialData.account_starting_date) {
        setAccountStartingDate(new Date(initialData.account_starting_date));
      }
      if (initialData.account_ending_date) {
        setAccountEndingDate(new Date(initialData.account_ending_date));
      }
      if (initialData.expires_at) {
        setExpirationDate(new Date(initialData.expires_at));
      }
    }
  }, [initialData, form]);

  const onSubmit = async (data: TAccountsService) => {
    try {
      setLoading(true);

      // Check if account name exists
      const { success: isNameExiste } = await checkIfAccountNameExists(
        serviceId,
        data.name.trim()
      );
      if (isNameExiste && !accountId) {
        toast.error("Account name already exists");
        form.setFocus("name");
        setLoading(false);
        return;
      }

      // Check if email exists in any account
      const { accounts } = await getServiceAccounts(serviceId);
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

      // For personal accounts, ensure expires_at matches account_ending_date
      if (data.account_type === "personal" && data.account_ending_date) {
        data.expires_at = data.account_ending_date;
      }

      if (accountId) {
        // Update existing account
        const { success } = await updateServiceAccount(
          serviceId,
          accountId,
          data
        );
        if (success) {
          toast.success("Account updated successfully");
          form.reset();
          router.push(`/services/${serviceId}`);
        } else {
          toast.error("Error while updating account");
        }
      } else {
        // Create new account
        const { success, accountId: newAccountId } = await addServiceAccount(
          serviceId,
          data
        );

        if (success) {
          toast.success("New account created successfully");
          form.reset();

          // Redirect based on account type
          if (data.account_type === "personal") {
            // Personal accounts go directly to the service dashboard
            router.push(`/services/${serviceId}`);
          } else {
            // Shared accounts go to upload users page
            router.push(`/services/${serviceId}/${newAccountId}/add-user`);
          }
        } else {
          toast.error("Error while creating new account");
        }
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
        {accountId ? "Update" : "Create New"} Account for {serviceName}
      </h1>
      <p className="text-muted-foreground mt-2 text-center">
        Fill out the form below to {accountId ? "update the" : "create a new"}{" "}
        account.
      </p>

      {/* Display fetch error if there is one */}
      {fetchError && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive font-medium">
            Error loading account data
          </p>
          <p className="text-sm text-destructive/80 mt-1">{fetchError}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="account_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!!accountId} // Disable when editing existing account
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="shared">Shared Account</SelectItem>
                    <SelectItem value="personal">Personal Account</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {accountId
                    ? "Account type cannot be changed after creation"
                    : "Personal accounts store user info directly, shared accounts can have multiple users"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {/* Personal Account User Fields */}
          {accountType === "personal" && (
            <>
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">
                  Personal User Information
                </h3>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="user_full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter user's full name"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Required for personal accounts
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user_phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Enter phone number"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional contact number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="account_starting_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col space-y-2">
                          <AccountDatePicker
                            label="Account Starting Date"
                            placeholder="Pick subscription start date"
                            date={accountStartingDate}
                            setDate={(date) => {
                              setAccountStartingDate(date);
                              if (date) {
                                const formattedDate =
                                  formatDateForStorage(date);
                                field.onChange(formattedDate);
                              } else {
                                field.onChange(null);
                              }
                            }}
                          />
                          <FormDescription>
                            When the subscription starts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="account_ending_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col space-y-2">
                          <AccountDatePicker
                            label="Account Ending Date"
                            placeholder="Pick subscription end date"
                            date={accountEndingDate}
                            setDate={(date) => {
                              setAccountEndingDate(date);
                              const formattedDate = date
                                ? formatDateForStorage(date)
                                : null;
                              field.onChange(formattedDate);

                              // Auto-set expires_at to match ending date for personal accounts
                              if (formattedDate && accountType === "personal") {
                                form.setValue("expires_at", formattedDate);
                                setExpirationDate(date);
                              }
                            }}
                            startingDate={accountStartingDate}
                            showPresets={true}
                            minDate={accountStartingDate}
                          />
                          <FormDescription>
                            When the subscription ends
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Only show expiration date for shared accounts */}
          {accountType === "shared" && (
            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-2">
                  <AccountDatePicker
                    label="Account Expiration Date"
                    placeholder="Pick an expiration date (optional)"
                    date={expirationDate}
                    setDate={(date) => {
                      setExpirationDate(date);
                      const formattedDate = date
                        ? formatDateForStorage(date)
                        : null;
                      field.onChange(formattedDate);
                    }}
                  />
                  <FormDescription>
                    Optional: When shared account access expires (affects all
                    users)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
              onClick={() => router.push(`/services/${serviceId}`)}
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
