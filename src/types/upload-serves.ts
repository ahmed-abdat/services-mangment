import { Database } from "@/types/database.types";
import { Thumbnail as DashboardThumbnail } from "@/features/dashboard/types/dashboard.types";

export type Service = Database["public"]["Tables"]["services"]["Row"];
export type { DashboardThumbnail as Thumbnail };
