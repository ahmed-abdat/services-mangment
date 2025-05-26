import { z } from "zod";

// Service Schema
export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  thumbnail: z
    .object({
      url: z.string().url("Invalid thumbnail URL"),
      name: z.string(),
      file: z.instanceof(File).optional(),
    })
    .nullable(),
});

// Service Account Schema
export const serviceAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  details: z.string().optional().nullable(),
  thumbnail: z
    .object({
      url: z.string().url("Invalid thumbnail URL"),
      name: z.string(),
      file: z.instanceof(File).optional(),
    })
    .nullable(),
});

// User Schema
export const userSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone_number: z
    .string()
    .regex(/^[+]?[\d\s\-()]+$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
  starting_date: z
    .string()
    .min(1, "Starting date is required")
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
  ending_date: z
    .string()
    .min(1, "Ending date is required")
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
  subscription_status: z.enum(["active", "expired", "pending"]).optional(),
});

// Export types from schemas
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type ServiceAccountFormData = z.infer<typeof serviceAccountSchema>;
export type UserFormData = z.infer<typeof userSchema>;
