"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React from "react";
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
import { addServiceAccount, getServiceAccount } from "@/app/action";
import { useRouter } from "next/navigation";

export default function UploadAccounts({
  params,
}: {
  params: { servicename: string };
}) {

    const router = useRouter();


    
    const [loading, setLoading] = React.useState<boolean>(false);
    const form = useForm<TAccountsService>({
    resolver: zodResolver(AccountsService),
    mode: "onChange",
});

const onSubmit = async (data: TAccountsService) => {
    console.log(data);

    try {
        
        setLoading(true)
        const {success : isNameExiste } = await getServiceAccount(params.servicename , data.name.trim());
        if(isNameExiste ){
            toast.error("account name already existe");
            // focus on the input
            form.setFocus("name");
            setLoading(false);
            return
        } 
        
        const {success} = await addServiceAccount(params.servicename, data);

        if(success) {
            toast.success("new account created successfully");
            form.reset();
            router.push(`/services/${params.servicename}`);
        } else {
            toast.error("error while creating new account");
        }
        setLoading(false);
        
    } catch (error) {
        console.log(error);
        toast.error("error while creating new account");  
    }
};


  return (
    <section className="mx-auto sm:flex mt-8 sm:flex-col md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-center">
        Creat New {params.servicename} Service Accounts
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>account name </FormLabel>
                <FormControl>
                  <Input placeholder="your account name here" {...field} />
                </FormControl>
                <FormDescription>account name must be unique</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel> account details </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="your account details here"
                    className="resize-none min-h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between gap-x-4 w-full">
          
          {/* cancel button */}
            <Button
                type="button"
                variant='secondary'
                onClick={() => router.push(`/services/${params.servicename}`)}
                className="w-full mx-auto md:max-w-full text-lg"
            >
                cancel
            </Button>
            <Button
            type="submit"
            className="w-full mx-auto md:max-w-full text-lg"
            disabled={loading}
          >
            creat new account
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
