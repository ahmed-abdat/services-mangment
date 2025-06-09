"use client";

import { Service } from "@/types/upload-serves";
import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Settings,
  Trash,
  ExternalLink,
  Package,
  Users,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { getServiceAccountCount } from "@/app/actions/service-actions";
import { DeleteServiceDialog } from "./services/DeleteServiceDialog";
import { useRouter } from "next/navigation";

// Helper function to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
};

export default function ServiceProfile({ service }: { service: Service }) {
  const [accountCount, setAccountCount] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const updateUrl = `/services/${service?.id}/edit-service`;

  // Fetch account count using server action
  useEffect(() => {
    if (service?.id) {
      startTransition(async () => {
        try {
          const count = await getServiceAccountCount(service.id);
          setAccountCount(count);
        } catch (error) {
          console.error("Error fetching account count:", error);
          setAccountCount(0);
        }
      });
    }
  }, [service?.id]);

  if (!service) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <CardContent>
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[400px] flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg border-border/50 hover:border-border group">
      {/* Image Section */}
      <div className="relative h-48 bg-muted/30">
        <Link href={`/services/${service?.id}`}>
          <Image
            src={service?.thumbnail_url ?? "/no-image.png"}
            alt={service?.name ?? "Service thumbnail"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Account count badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="bg-background/90 backdrop-blur-sm shadow-sm"
          >
            <Users className="w-3 h-3 mr-1" />
            {isPending ? "..." : accountCount}
          </Badge>
        </div>

        {/* Quick link */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/services/${service?.id}`}>
            <div className="bg-background/90 backdrop-blur-sm p-2 rounded-lg hover:bg-primary/10 shadow-sm">
              <ExternalLink className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex-1 space-y-3">
          <Link href={`/services/${service?.id}`}>
            <h3 className="font-semibold text-lg mb-2 line-clamp-1 hover:text-primary transition-colors flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              {service?.name}
            </h3>
          </Link>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Created {formatDate(service?.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>
                {isPending
                  ? "Loading..."
                  : `Managing ${accountCount} ${
                      accountCount === 1 ? "account" : "accounts"
                    }`}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 mt-auto border-t">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete service</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Link href={updateUrl}>
                    <Settings className="w-4 h-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit service</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>

      {/* Delete Dialog */}
      <DeleteServiceDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        service={service}
        onDeleted={() => {
          router.refresh();
        }}
      />
    </Card>
  );
}
