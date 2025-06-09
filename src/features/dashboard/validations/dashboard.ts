import { z } from "zod";

// Dashboard Statistics Validation
export const dashboardStatSchema = z.object({
  title: z.string().min(1, "Title is required"),
  value: z.union([z.string(), z.number()]),
  description: z.string().optional(),
  trend: z
    .object({
      value: z.number(),
      isPositive: z.boolean(),
    })
    .optional(),
  status: z.enum(["success", "warning", "error", "info"]).optional(),
});

// Activity Item Validation
export const activityItemSchema = z.object({
  id: z.number().positive(),
  type: z.enum([
    "service_created",
    "service_updated",
    "service_warning",
    "user_registered",
    "user_updated",
    "system_alert",
  ]),
  message: z.string().min(1, "Message is required"),
  time: z.string().min(1, "Time is required"),
  status: z.enum(["success", "warning", "error", "info"]),
  metadata: z.record(z.any()).optional(),
});

// System Metric Validation
export const systemMetricSchema = z.object({
  name: z.string().min(1, "Metric name is required"),
  value: z.number().min(0).max(100, "Value must be between 0 and 100"),
  unit: z.string().min(1, "Unit is required"),
  status: z.enum(["healthy", "warning", "critical"]),
  threshold: z
    .object({
      warning: z.number().min(0).max(100),
      critical: z.number().min(0).max(100),
    })
    .optional(),
});

// System Health Validation
export const systemHealthSchema = z.object({
  cpu: systemMetricSchema,
  memory: systemMetricSchema,
  disk: systemMetricSchema,
  network: systemMetricSchema.optional(),
  uptime: z.string().min(1, "Uptime is required"),
  lastUpdated: z.date(),
});

// Service Status Validation
export const serviceStatusSchema = z.object({
  id: z.string().min(1, "Service ID is required"),
  name: z.string().min(1, "Service name is required"),
  status: z.enum(["active", "inactive", "warning", "error"]),
  uptime: z.number().min(0, "Uptime must be positive"),
  lastChecked: z.date(),
  responseTime: z.number().min(0).optional(),
  errorRate: z.number().min(0).max(100).optional(),
});

// Navigation Item Validation
export const navigationItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL"),
  badge: z.union([z.string(), z.number()]).optional(),
  isActive: z.boolean().optional(),
});

// User Profile Validation
export const userProfileSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email"),
  avatar: z.string().url("Must be a valid URL").optional(),
  role: z.enum(["admin", "user", "moderator"]),
  permissions: z.array(z.string()),
  lastLogin: z.date().optional(),
});

// Dashboard Data Validation
export const dashboardDataSchema = z.object({
  stats: z.array(dashboardStatSchema),
  recentActivity: z.array(activityItemSchema),
  systemHealth: systemHealthSchema,
  serviceStatuses: z.array(serviceStatusSchema),
  notifications: z.object({
    count: z.number().min(0),
    unread: z.number().min(0),
  }),
});

// API Response Validation
export const dashboardApiResponseSchema = z.object({
  success: z.boolean(),
  data: dashboardDataSchema.optional(),
  error: z.string().optional(),
  timestamp: z.date(),
});

export const statsApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(dashboardStatSchema).optional(),
  error: z.string().optional(),
});

export const activityApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(activityItemSchema).optional(),
  pagination: z
    .object({
      page: z.number().positive(),
      limit: z.number().positive(),
      total: z.number().min(0),
      hasMore: z.boolean(),
    })
    .optional(),
  error: z.string().optional(),
});

// Form Validation Schemas
export const createServiceFormSchema = z.object({
  name: z.string().min(1, "Service name is required").max(100, "Name too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description too long"),
  type: z.enum(["api", "web", "database", "microservice", "other"]),
  environment: z.enum(["development", "staging", "production"]),
  url: z.string().url("Must be a valid URL").optional(),
  healthCheckUrl: z.string().url("Must be a valid URL").optional(),
  tags: z.array(z.string()).optional(),
});

export const updateUserFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Must be a valid email"),
  role: z.enum(["admin", "user", "moderator"]),
  permissions: z.array(z.string()),
});

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  serviceAlerts: z.boolean(),
  systemAlerts: z.boolean(),
  weeklyReports: z.boolean(),
});

// Type exports for use in components
export type DashboardStatInput = z.infer<typeof dashboardStatSchema>;
export type ActivityItemInput = z.infer<typeof activityItemSchema>;
export type SystemHealthInput = z.infer<typeof systemHealthSchema>;
export type ServiceStatusInput = z.infer<typeof serviceStatusSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type DashboardDataInput = z.infer<typeof dashboardDataSchema>;
export type CreateServiceFormInput = z.infer<typeof createServiceFormSchema>;
export type UpdateUserFormInput = z.infer<typeof updateUserFormSchema>;
export type NotificationSettingsInput = z.infer<
  typeof notificationSettingsSchema
>;
