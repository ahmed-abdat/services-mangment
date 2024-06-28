import { z } from "zod";

export const AccountsService = z.object({
  name: z.string().min(2, {
    message: "account name must be at least 2 characters long",
  }),
  details: z
    .string()
    .max(50, {
      message: "details must be at most 50 characters long",
    })
    .optional(),
});

export type TAccountsService = z.infer<typeof AccountsService>;
