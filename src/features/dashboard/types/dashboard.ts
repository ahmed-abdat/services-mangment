import { LucideIcon } from "lucide-react";

// Dashboard Statistics Types
export interface DashboardStat {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  status?: "success" | "warning" | "error" | "info";
}

// Activity Types
export interface ActivityItem {
  id: number;
  type:
    | "service_created"
    | "service_updated"
    | "service_warning"
    | "user_registered"
    | "user_updated"
    | "system_alert";
  message: string;
  time: string;
  status: "success" | "warning" | "error" | "info";
  metadata?: Record<string, any>;
}

// Navigation Types
export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string | number;
  isActive?: boolean;
  children?: NavigationItem[];
}

// System Health Types
export interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface SystemHealth {
  cpu: SystemMetric;
  memory: SystemMetric;
  disk: SystemMetric;
  network?: SystemMetric;
  uptime: string;
  lastUpdated: Date;
}

// Service Status Types
export interface ServiceStatus {
  id: string;
  name: string;
  status: "active" | "inactive" | "warning" | "error";
  uptime: number;
  lastChecked: Date;
  responseTime?: number;
  errorRate?: number;
}

// Dashboard Data Types
export interface DashboardData {
  stats: DashboardStat[];
  recentActivity: ActivityItem[];
  systemHealth: SystemHealth;
  serviceStatuses: ServiceStatus[];
  notifications: {
    count: number;
    unread: number;
  };
}

// User Profile Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "user" | "moderator";
  permissions: string[];
  lastLogin?: Date;
}

// Layout Types
export interface LayoutProps {
  children: React.ReactNode;
  user?: UserProfile;
  navigation?: NavigationItem[];
}

// Component Props Types
export interface StatCardProps {
  stat: DashboardStat;
  className?: string;
}

export interface ActivityListProps {
  activities: ActivityItem[];
  maxItems?: number;
  showTimestamp?: boolean;
  className?: string;
}

export interface SystemHealthProps {
  health: SystemHealth;
  showDetails?: boolean;
  className?: string;
}

// API Response Types
export interface DashboardApiResponse {
  success: boolean;
  data?: DashboardData;
  error?: string;
  timestamp: Date;
}

export interface StatsApiResponse {
  success: boolean;
  data?: DashboardStat[];
  error?: string;
}

export interface ActivityApiResponse {
  success: boolean;
  data?: ActivityItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  error?: string;
}
