"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Settings,
  Trash,
  ExternalLink,
  User,
  Calendar,
  Mail,
} from "lucide-react";
import { ServiceAccount } from "@/types/services/service-accounts";
import { mainRoute } from "@/lib/mainroute";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// Helper function to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
};

export default function AccountCard({
  account,
  serviceId,
}: {
  account: ServiceAccount;
  serviceId: string;
}) {
  // Create URLs for delete and update actions
  const getUrls = () => {
    const url = new URL(`${mainRoute}/services/${serviceId}`);
    url.searchParams.set("serviceName", serviceId);
    url.searchParams.set("openModal", "true");
    url.searchParams.set("accountId", account.id);

    const updateUrl = new URL(
      `${mainRoute}/services/${serviceId}/upload-accounts`
    );
    updateUrl.searchParams.set("accountId", account.id);

    return { url: url.toString(), updateUrl: updateUrl.toString() };
  };

  const { url, updateUrl } = getUrls();

  if (!account || !serviceId) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <CardContent>
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[400px] flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg group">
      {/* Image Section */}
      <div className="relative h-48 bg-muted">
        <Link href={`/services/${serviceId}/${account.id}`}>
          <Image
            src={account?.thumbnail_url ?? "/no-image.png"}
            alt={account?.name ?? "Account thumbnail"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="bg-background/80 backdrop-blur-sm"
          >
            <User className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>

        {/* Quick link */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/services/${serviceId}/${account.id}`}>
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-primary/10">
              <ExternalLink className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <Link href={`/services/${serviceId}/${account.id}`}>
            <h3 className="font-semibold text-lg mb-2 line-clamp-1 hover:text-primary transition-colors flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              {account?.name}
            </h3>
          </Link>

          {/* Account details */}
          {account.details && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {account.details}
            </p>
          )}

          {/* Essential account information */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="break-all line-clamp-1">{account.email}</span>
            </div>
            {account.created_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(account.created_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 mt-auto border-t">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={url}>
                  <div className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <Trash className="w-4 h-4" />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Delete account</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={updateUrl}>
                  <div className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                    <Settings className="w-4 h-4" />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit account</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
