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

  // 1. Normalize paths safely & apply translations
  const localizedSidebarItems = TRAINER_SIDEBAR_DATA.map((item) => {
    const translationKey = item.id as Parameters<typeof t>[0];

    // Ensure item.href is safely handled as a string
    const rawHref = typeof item.href === "string" ? item.href : "";

    let targetHref = rawHref;
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

  // 2. Determine active item based on current pathname (explicitly handling sub-routes like template builder)
  const activeItem =
    localizedSidebarItems.find((item) => {
      // If we are in the template builder, highlight the "templates" sidebar menu item
      if (pathname.includes("/trainer/template")) {
        return item.id === "templates";
      }
      if (item.href === "/trainer" || item.href === "/trainer/dashboard") {
        return pathname === "/trainer" || pathname === "/trainer/dashboard";
      }
      return pathname.startsWith(item.href);
    }) ?? localizedSidebarItems[0];

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
        <header className="px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10 flex flex-col gap-2">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight capitalize">
              {activeItem?.label ?? "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
             
            </p>
          </div>
        </header>

        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}