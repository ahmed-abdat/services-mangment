import { z } from "zod";

// Account validation schema supporting both personal and shared account types
export const AccountsService = z
  .object({
    // Basic account fields
    name: z.string().min(2, {
      message: "Account name must be at least 2 characters long.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    details: z
      .string()
      .max(255, {
        message: "Details must be at most 255 characters long.",
      })
      .optional(),
    expires_at: z.string().nullable().optional(),
    account_type: z.enum(["personal", "shared"], {
      required_error: "Please select an account type.",
    }),

    // Personal account user fields (only required for personal accounts)
    user_full_name: z.string().nullable().optional(),
    user_phone_number: z
      .string()
      .regex(/^[\d\s\-\+\(\)]*$/, {
        message:
          "Phone number can only contain numbers, spaces, dashes, plus signs, and parentheses.",
      })
      .nullable()
      .optional(),
    account_starting_date: z.string().nullable().optional(),
    account_ending_date: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // Personal accounts must have user information
      if (data.account_type === "personal") {
        return (
          data.user_full_name &&
          data.user_full_name.trim().length >= 2 &&
          data.account_starting_date &&
          data.account_ending_date
        );
      }
      return true;
    },
    {
      message:
        "Personal accounts require user full name, starting date, and ending date.",
      path: ["user_full_name"],
    }
  )
  .refine(
    (data) => {
      // Shared accounts should not have user information
      if (data.account_type === "shared") {
        return (
          !data.user_full_name &&
          !data.user_phone_number &&
          !data.account_starting_date &&
          !data.account_ending_date
        );
      }
      return true;
    },
    {
      message: "Shared accounts should not contain user information.",
      path: ["account_type"],
    }
  )
  .refine(
    (data) => {
      // Validate date order for personal accounts
      if (
        data.account_type === "personal" &&
        data.account_starting_date &&
        data.account_ending_date
      ) {
        const startDate = new Date(data.account_starting_date);
        const endDate = new Date(data.account_ending_date);
        return startDate < endDate;
      }
      return true;
    },
    {
      message: "Account ending date must be after starting date.",
      path: ["account_ending_date"],
    }
  );

export type TAccountsService = z.infer<typeof AccountsService>;

// User validation schema for adding users to accounts
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
