"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TRAINER_SIDEBAR_DATA } from "@/data/sidebars/trainerSidebar.data";
import { ChevronRight } from "lucide-react";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();

  // 1. Normalize paths & apply translations to sidebar items
  const localizedSidebarItems = TRAINER_SIDEBAR_DATA.map((item) => {
    const translationKey = item.id as Parameters<typeof t>[0];

    // Safely construct normalized absolute URLs
    let targetHref = item.href;
    if (!targetHref || targetHref === "") {
      targetHref = "/trainer/dashboard";
    } else if (!targetHref.startsWith("/")) {
      targetHref = `/trainer/${targetHref}`;
    }

    return {
      ...item,
      label: t.has(translationKey) ? t(translationKey) : item.label,
      href: targetHref,
    };
  });

  // 2. Determine active item based on current pathname
  const activeItem =
    localizedSidebarItems.find((item) => {
      if (item.href === "/trainer" || item.href === "/trainer/dashboard") {
        return pathname === "/trainer" || pathname === "/trainer/dashboard";
      }
      return pathname.startsWith(item.href);
    }) ?? localizedSidebarItems[0];

  // 3. Format breadcrumb segments with localized fallbacks
  const pathSegments = pathname.split("/").filter(Boolean);

  const getBreadcrumbLabel = (segment: string) => {
    const matchedItem = localizedSidebarItems.find(
      (item) => item.id === segment || item.href.endsWith(`/${segment}`)
    );
    if (matchedItem) return matchedItem.label;
    if (t.has(segment as Parameters<typeof t>[0])) {
      return t(segment as Parameters<typeof t>[0]);
    }
    return segment.replace(/-/g, " ");
  };

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
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {pathSegments.map((segment, index) => {
              const isLast = index === pathSegments.length - 1;
              const label = getBreadcrumbLabel(segment);

              return (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight className="h-3 w-3 rtl:rotate-180 shrink-0" />}
                  <span
                    className={
                      isLast
                        ? "text-foreground font-medium capitalize"
                        : "capitalize hover:text-foreground transition-colors"
                    }
                  >
                    {label}
                  </span>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight capitalize">
              {activeItem?.label ?? "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {locale === "ar"
                ? `إدارة ${activeItem?.label} الخاصة بك بسلاسة.`
                : `Manage your ${String(activeItem?.label).toLowerCase()} workspace seamlessly.`}
            </p>
          </div>
        </header>

        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}