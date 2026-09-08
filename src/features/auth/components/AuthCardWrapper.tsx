"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AuthCardWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function AuthCardWrapper({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthCardWrapperProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-background">
      <div
        className={cn(
          "w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm space-y-6",
          className
        )}
      >
        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="space-y-4">{children}</div>

        {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}