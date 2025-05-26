import { z } from "zod";

export const UserAccount = z.object({
  full_name: z.string().min(2, {
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
    .regex(/^[\d\s\-\+\(\)]*$/, {
      message:
        "Phone number can only contain numbers, spaces, dashes, plus signs, and parentheses.",
    })
    .min(1, {
      message: "Phone number cannot be empty if provided.",
    })
    .optional()
    .or(z.literal("")),
});

export type TUserAccount = z.infer<typeof UserAccount>;
