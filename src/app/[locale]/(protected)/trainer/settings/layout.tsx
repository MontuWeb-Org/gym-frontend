"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { ROUTES } from "@/data/routes";
import { cn } from "@/lib/cn";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      href: ROUTES.TRAINER.SETTINGS.PROFILE,
    },
    {
      id: "notifications",
      label: "Notifications",
      href: ROUTES.TRAINER.SETTINGS.NOTIFICATIONS,
    },
  ];

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Tab Header Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-6 -mb-px" aria-label="Settings navigation">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.id === "profile" && pathname === ROUTES.TRAINER.SETTINGS.ROOT);

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "pb-3 pt-2 text-sm font-medium border-b-2 transition-colors cursor-pointer",
                  isActive
                    ? "border-primary text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab Page Render Area */}
      <div className="pt-2">{children}</div>
    </div>
  );
}