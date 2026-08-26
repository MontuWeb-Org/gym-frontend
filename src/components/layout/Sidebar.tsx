"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Menu, X, LayoutDashboard } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { APP_ROUTES, type UserRole } from "@/data/routes";
import { ICON_MAP, LAYOUT_CONFIG } from "@/data/layout-config";
import { cn } from "@/lib/cn";

interface SidebarProps {
  currentUserRole?: UserRole;
}

export function Sidebar({ currentUserRole = "trainee" }: SidebarProps) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarRoutes = APP_ROUTES.filter((route) => {
    if (!route.showInSidebar) return false;
    if (!route.allowedRoles) return true;
    return route.allowedRoles.includes(currentUserRole);
  });

  return (
    <>
      {/* Mobile Toggle on the bottom left */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 left-4 z-40 md:hidden p-3 rounded-full bg-primary text-primary-foreground shadow-lg rtl:left-auto rtl:right-4"
        aria-label={t(LAYOUT_CONFIG.ariaLabels.toggleSidebar)}
      >
        {isMobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Drawer positioned below the navbar */}
      <aside
        className={cn(
          "fixed md:static top-16 bottom-0 start-0 z-30 flex flex-col justify-between border-r border-border bg-background transition-all duration-300 h-[calc(100vh-4rem)] md:h-auto",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground transition-colors"
              aria-label={t(LAYOUT_CONFIG.ariaLabels.toggleSidebar)}
            >
              {isCollapsed ? (
                <ChevronRight className="size-4 rtl:rotate-180" />
              ) : (
                <ChevronLeft className="size-4 rtl:rotate-180" />
              )}
            </button>
          </div>

          <nav className="space-y-1">
            {sidebarRoutes.map((route) => {
              const Icon = route.iconName ? ICON_MAP[route.iconName] || LayoutDashboard : LayoutDashboard;

              const isActive =
                route.path === "/"
                  ? pathname === "/"
                  : pathname === route.path || pathname.startsWith(`${route.path}/`);

              return (
                <Link
                  key={route.id}
                  href={route.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={isCollapsed ? t(route.titleKey) : undefined}
                >
                  <Icon className="size-5 shrink-0" />
                  {!isCollapsed && <span>{t(route.titleKey)}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}