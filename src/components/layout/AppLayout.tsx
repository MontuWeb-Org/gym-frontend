"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useAppSelector } from "@/store/hooks";
import { Sidebar } from "./Sidebar";
import { ROLE_SIDEBAR_DATA } from "@/data/sidebar.data";
import type { SidebarItem } from "@/data/sidebar.types";
import type { UserRole } from "@/data/routes";

interface AppLayoutProps {
  children?: React.ReactNode;
}

/**
 * Generic, data-driven layout shell with full multi-language i18n support.
 */
export function AppLayout({ children }: AppLayoutProps) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);

  // Derive role from logged-in user or infer from current route
  const inferredRole: UserRole = 
    user?.role ?? 
    (pathname.includes("/admin") ? "admin" : 
     pathname.includes("/coach") ? "coach" : 
     "trainee");

  const userRole = inferredRole;

  const roleConfig = ROLE_SIDEBAR_DATA[userRole] ?? ROLE_SIDEBAR_DATA.trainee;
  const defaultTab = roleConfig.items[0]?.id ?? "";

  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const handleItemClick = (item: SidebarItem) => setActiveTab(item.id);

  // Translate sidebar items dynamically
  const localizedItems: SidebarItem[] = roleConfig.items.map((item) => {
    let label = item.label;
    if (item.id.includes("dashboard")) label = t("dashboard");
    else if (item.id.includes("trainees")) label = t("trainees");
    else if (item.id.includes("programs")) label = t("programs");
    else if (item.id.includes("templates")) label = t("templates");
    else if (item.id.includes("billing")) label = t("billing");
    else if (item.id.includes("members")) label = t("members");
    else if (item.id.includes("classes")) label = t("classes");
    else if (item.id.includes("workouts")) label = t("workouts");
    else if (item.id.includes("profile")) label = t("profile");
    else if (item.id.includes("settings")) label = t("settings");

    return {
      ...item,
      label,
    };
  });

  // Localized sidebar header title
  const localizedTitle = (
    <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary border-b border-border mb-2">
      <span>
        {userRole === "admin"
          ? t("adminManagement")
          : userRole === "coach"
          ? t("coachHub")
          : t("traineePortal")}
      </span>
    </div>
  );

  // Look up the active item and render its declared component
  const activeItem = roleConfig.items.find((item) => item.id === activeTab);
  const ActiveView = activeItem?.component ?? roleConfig.defaultComponent;

  return (
    <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-[calc(100vh-4rem)]">
      <Sidebar
        title={localizedTitle}
        items={localizedItems}
        user={user}
        activeTab={activeTab}
        onItemClick={handleItemClick}
      />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-background">
        <div className="mx-auto max-w-7xl">
          {ActiveView ? <ActiveView /> : children}
        </div>
      </main>
    </div>
  );
}