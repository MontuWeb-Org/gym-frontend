"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TRAINEE_SIDEBAR_DATA } from "@/data/sidebars/traineeSidebar.data";

export default function TraineeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  // 1. Normalize route paths & apply translations
  const localizedSidebarItems = TRAINEE_SIDEBAR_DATA.map((item) => {
    const translationKey = item.id as Parameters<typeof t>[0];

    let targetHref = item.href;
    if (!targetHref || targetHref === "") {
      targetHref = "/trainee/dashboard";
    } else if (!targetHref.startsWith("/")) {
      targetHref = `/trainee/${targetHref}`;
    }

    return {
      ...item,
      label: t.has(translationKey) ? t(translationKey) : item.label,
      href: targetHref,
    };
  });
  
  const traineeHubTitle = t.has("traineeHub" as Parameters<typeof t>[0])
    ? t("traineeHub" as Parameters<typeof t>[0])
    : "Trainee Hub";

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <Sidebar
        title={traineeHubTitle}
        items={localizedSidebarItems}
        activePath={pathname}
      />

      <div className="flex-1 flex flex-col overflow-y-auto bg-background">
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}