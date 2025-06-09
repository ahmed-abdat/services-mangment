"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  sticky?: boolean;
}

export function PageBreadcrumb({
  items,
  className,
  sticky = false,
}: PageBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground",
        sticky
          ? "sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 px-4 border-b"
          : "mt-4",
        className
      )}
    >
      {/* Home/Dashboard link */}
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {items.length > 0 && <ChevronRight className="h-4 w-4 flex-shrink-0" />}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center space-x-1">
            {item.href && !item.isCurrentPage ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate max-w-[200px]",
                  item.isCurrentPage && "text-foreground font-medium"
                )}
              >
                {item.label}
              </span>
            )}

            {!isLast && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
          </div>
        );
      })}
    </nav>
  );
}
