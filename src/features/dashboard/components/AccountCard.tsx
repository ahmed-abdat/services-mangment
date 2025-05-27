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
  Clock,
  Users,
} from "lucide-react";
import { ServiceAccount } from "@/types/services/service-accounts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getAccountUsers } from "@/features/dashboard/actions/service-users";
import { DeleteAccountDialog } from "./accounts/DeleteAccountDialog";
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

// Helper function to check if account is expired or expiring soon
const getExpirationStatus = (expiresAt: string | null) => {
  if (!expiresAt) return null;

  const today = new Date();
  const expiration = new Date(expiresAt);
  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: "expired", days: Math.abs(diffDays) };
  if (diffDays <= 7) return { status: "expiring", days: diffDays };
  return { status: "active", days: diffDays };
};

export default function AccountCard({
  account,
  serviceId,
}: {
  account: ServiceAccount;
  serviceId: string;
}) {
  const [userCount, setUserCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  // Fetch user count for shared accounts
  useEffect(() => {
    const fetchUserCount = async () => {
      if (account.account_type === "personal") {
        setUserCount(1); // Personal accounts always have 1 user
        setIsLoadingCount(false);
      } else {
        try {
          const { success, users } = await getAccountUsers(
            serviceId,
            account.id
          );
          setUserCount(success ? users.length : 0);
        } catch (error) {
          console.error("Error fetching user count:", error);
          setUserCount(0);
        } finally {
          setIsLoadingCount(false);
        }
      }
    };

    if (account && serviceId) {
      fetchUserCount();
    }
  }, [account, serviceId]);

  // Create update URL
  const updateUrl = `/services/${serviceId}/upload-accounts?accountId=${account.id}`;
  const expirationStatus = getExpirationStatus(account.expires_at);

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

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {/* Account type badge */}
          <Badge
            variant="secondary"
            className="bg-background/80 backdrop-blur-sm"
          >
            {account.account_type === "personal" ? (
              <User className="w-3 h-3 mr-1" />
            ) : (
              <Users className="w-3 h-3 mr-1" />
            )}
            {account.account_type === "personal" ? "Personal" : "Shared"}
          </Badge>

          {/* User count badge */}
          <Badge
            variant="outline"
            className="bg-background/80 backdrop-blur-sm"
          >
            <Users className="w-3 h-3 mr-1" />
            {isLoadingCount
              ? "..."
              : `${userCount} User${userCount !== 1 ? "s" : ""}`}
          </Badge>

          {/* Expiration status badge */}
          {expirationStatus && (
            <Badge
              variant={
                expirationStatus.status === "expired"
                  ? "destructive"
                  : expirationStatus.status === "expiring"
                  ? "destructive"
                  : "default"
              }
              className={
                expirationStatus.status === "expired"
                  ? "bg-red-500/90 text-white backdrop-blur-sm"
                  : expirationStatus.status === "expiring"
                  ? "bg-orange-500/90 text-white backdrop-blur-sm"
                  : "bg-green-500/90 text-white backdrop-blur-sm"
              }
            >
              <Clock className="w-3 h-3 mr-1" />
              {expirationStatus.status === "expired"
                ? `Expired ${expirationStatus.days}d ago`
                : expirationStatus.status === "expiring"
                ? `${expirationStatus.days}d left`
                : `${expirationStatus.days}d left`}
            </Badge>
          )}
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
            {account.expires_at && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Expires {formatDate(account.expires_at)}</span>
              </div>
            )}
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
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash className="w-4 h-4" />
                </Button>
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

      {/* Delete Dialog */}
      <DeleteAccountDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        serviceId={serviceId}
        account={account}
        onDeleted={() => {
          router.refresh();
        }}
      />
    </Card>
  );
}
