import { z } from "zod";

export const UserAccount = z.object({
  email: z.string().email(),
  description: z
    .string()
    .max(50, {
      message: "Description must be at most 50 characters long.",
    })
    .optional(),
});

export type TUserAccount = z.infer<typeof UserAccount>;
