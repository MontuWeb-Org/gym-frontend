"use client";

import React from "react";

interface AuthCardWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export default function AuthCardWrapper({
  title,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-md",
}: AuthCardWrapperProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-background">
      <div className={`w-full ${maxWidth} rounded-xl border border-border bg-card p-8 shadow-sm space-y-6`}>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="space-y-4">{children}</div>

        {footer && <div className="text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}