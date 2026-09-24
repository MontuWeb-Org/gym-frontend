"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  count?: number;
  badgeText?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  count,
  badgeText,
  actions,
  children,
  sticky = true,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "px-6 py-4 -mx-6 -mt-6 mb-6 border-b border-border bg-background/95 backdrop-blur-sm flex flex-col gap-3 text-start",
        sticky && "sticky top-0 z-10",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl tracking-wider font-bold text-foreground capitalize">
              {title}
            </h1>

            {/* Optional Count Badge */}
            {typeof count === "number" && (
              <Badge variant="secondary" className="font-mono text-md font-bold">
                {count}
              </Badge>
            )}

            {/* Optional Status / Category Badge */}
            {badgeText && (
              <Badge
                variant="outline"
                className="border-primary/40 text-md text-primary uppercase tracking-wider"
              >
                {badgeText}
              </Badge>
            )}
          </div>

          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>

      {children}
    </header>
  );
}