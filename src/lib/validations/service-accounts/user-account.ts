import { z } from "zod";

export const UserAccount = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters long.",
  }),
  description: z
    .string()
    .max(50, {
      message: "Description must be at most 50 characters long.",
    })
    .optional(),
  phone_number: z
    .string()
    .regex(/^\d{8}$/, {
      message: "Phone number must be exactly 8 digits.",
    })
    .optional(),
});

export type TUserAccount = z.infer<typeof UserAccount>;
