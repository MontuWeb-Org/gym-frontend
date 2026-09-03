"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Sidebar } from "@/components/layout/Sidebar";
import { ADMIN_SIDEBAR_DATA } from "@/data/sidebars/adminSidebar.data";
import type { SidebarItem } from "@/data/sidebar.types";
import ComingSoonView from "@/components/views/common/ComingSoonView";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<string>(
    ADMIN_SIDEBAR_DATA[0]?.id ?? "dashboard"
  );

  const localizedSidebarItems = ADMIN_SIDEBAR_DATA.map((item) => {
    const cleanPath = item.href.replace(/^\/admin/, "").replace(/^\//, "");
    const translationKey = item.id as Parameters<typeof t>[0];
    
    return {
      ...item,
      label: t.has(translationKey) ? t(translationKey) : item.label,
      href: cleanPath === "" 
        ? `/${locale}/admin` 
        : `/${locale}/admin/${cleanPath}`,
    };
  });

  const handleItemClick = (item: SidebarItem) => {
    setActiveTab(item.id);
  };

  const activeItem = ADMIN_SIDEBAR_DATA.find((item) => item.id === activeTab);
  const ActiveView = activeItem?.component;

  const activeTranslationKey = (activeItem?.id ?? "") as Parameters<typeof t>[0];
  const adminHubKey = "adminHub" as Parameters<typeof t>[0];

  const activeLabel = activeItem 
    ? (t.has(activeTranslationKey) ? t(activeTranslationKey) : activeItem.label) 
    : "Dashboard";

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <Sidebar
        title={t.has(adminHubKey) ? t(adminHubKey) : "Admin Hub"}
        items={localizedSidebarItems}
        activeTab={activeTab}
        onItemClick={handleItemClick}
      />

      <div className="flex-1 flex flex-col overflow-y-auto bg-background">
        <header className="p-6 border-b border-border bg-background sticky top-0 z-10">
          <h1 className="text-2xl font-bold capitalize">
            {activeLabel}
          </h1>
          <p className="text-sm text-muted-foreground">
            {locale === "ar"
              ? `إدارة لوحة ${activeLabel} الخاصة بك.`
              : `Manage your admin ${String(activeLabel).toLowerCase()} seamlessly.`}
          </p>
        </header>

        <main className="p-6 flex-1">
          {ActiveView ? (
            <ActiveView />
          ) : children ? (
            children
          ) : (
            <ComingSoonView />
          )}
        </main>
      </div>
    </div>
  );
}
