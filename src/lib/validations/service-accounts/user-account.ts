import { z } from "zod";

export const UserAccount = z.object({
    email: z.string().email(),
    telephone: z.string().min(8, {
        message: "Telephone number must be at least 8 characters long."
    }),
    description : z.string().max(50, {
        message: "Description must be at most 50 characters long."
    }).optional(),
});

export type TUserAccount = z.infer<typeof UserAccount>;