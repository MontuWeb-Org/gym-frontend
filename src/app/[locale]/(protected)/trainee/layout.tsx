// src/app/[locale]/(protected)/trainee/layout.tsx
"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Sidebar } from "@/components/layout/Sidebar";
import { TRAINEE_SIDEBAR_DATA } from "@/data/sidebars/traineeSidebar.data";
import type { SidebarItem } from "@/data/sidebar.types";

export default function TraineeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<string>(
    TRAINEE_SIDEBAR_DATA[0]?.id ?? "dashboard"
  );

  const handleItemClick = (item: SidebarItem) => {
    setActiveTab(item.id);
  };

  const activeItem = TRAINEE_SIDEBAR_DATA.find((item) => item.id === activeTab);
  const ActiveView = activeItem?.component;

  const activeLabel = activeItem ? (t.has(activeItem.id) ? t(activeItem.id) : activeItem.label) : "Dashboard";

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <Sidebar
        title={t("traineeHub")}
        items={TRAINEE_SIDEBAR_DATA}
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
              ? `عرض وإدارة قسم ${activeLabel} الخاص بك.`
              : `View and manage your trainee ${String(activeLabel).toLowerCase()}.`}
          </p>
        </header>

        <main className="p-6 flex-1">
          {ActiveView ? <ActiveView /> : children}
        </main>
      </div>
    </div>
  );
}