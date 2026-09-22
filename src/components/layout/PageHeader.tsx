"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  sticky?: boolean;
}

export function PageHeader({ title, description, actions, children, sticky = true }: PageHeaderProps) {
  return (
    <header
      className={
        "px-6 py-4 -mx-6 -mt-6 mb-6 border-b border-border bg-background/95 backdrop-blur-sm flex flex-col gap-2" +
        (sticky ? " sticky top-0 z-10" : "")
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight capitalize">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {children}
    </header>
  );
}