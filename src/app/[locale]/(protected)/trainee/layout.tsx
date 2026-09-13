"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TRAINEE_SIDEBAR_DATA } from "@/data/sidebars/traineeSidebar.data";
import { ChevronRight } from "lucide-react";

export default function TraineeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Nav");
  const locale = useLocale();
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

  // 2. Find active sidebar item based on current URL path
  const activeItem =
    localizedSidebarItems.find((item) => {
      if (item.href === "/trainee" || item.href === "/trainee/dashboard") {
        return pathname === "/trainee" || pathname === "/trainee/dashboard";
      }
      return pathname.startsWith(item.href);
    }) ?? localizedSidebarItems[0];

  // 3. Generate dynamic breadcrumb segments
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

          {/* Page Title & Subtitle */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight capitalize">
              {activeItem?.label ?? "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {locale === "ar"
                ? `عرض وإدارة قسم ${activeItem?.label} الخاص بك.`
                : `View and manage your trainee ${String(activeItem?.label).toLowerCase()} workspace.`}
            </p>
          </div>
        </header>

        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}