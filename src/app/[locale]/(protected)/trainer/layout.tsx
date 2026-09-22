"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TRAINER_SIDEBAR_DATA } from "@/data/sidebars/trainerSidebar.data";
import { ROUTES } from "@/data/routes";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  const localizedSidebarItems = TRAINER_SIDEBAR_DATA.map((item) => {
    const translationKey = item.id as Parameters<typeof t>[0];

    let targetHref =  typeof item.href === "string" ? item.href : "";
    if (!targetHref) {
      targetHref = ROUTES.TRAINER.DASHBOARD;
    } else if (!targetHref.startsWith("/")) {
      targetHref = `${ROUTES.TRAINER.ROOT}/${targetHref}`;
    }

    return {
      ...item,
      label: t.has(translationKey) ? t(translationKey) : item.label,
      href: targetHref,
    };
  });

  const trainerHubTitle = t.has("trainerHub" as Parameters<typeof t>[0])
    ? t("trainerHub" as Parameters<typeof t>[0])
    : "Trainer Hub";

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <Sidebar
        title={trainerHubTitle}
        items={localizedSidebarItems}
        activePath={pathname}
      />

      <div className="flex-1 flex flex-col overflow-y-auto bg-background">
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}