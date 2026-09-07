"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Menu, X, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import type { SidebarItem } from "@/data/sidebar.types";

export interface SidebarProps {
  title?: React.ReactNode;
  items: SidebarItem[];
  user?: {
    name: string;
    role: string;
    email?: string;
  } | null;
  activeTab?: string;
  activePath?: string;
  onItemClick?: (item: SidebarItem) => void;
}

export function Sidebar({
  title,
  items = [],
  user,
  activeTab,
  activePath = "",
  onItemClick,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <Button
        suppressHydrationWarning
        type="button"
        size="icon"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-16 start-6 z-40 md:hidden size-12 rounded-full shadow-lg bg-primary text-primary-foreground flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        aria-label={isMobileOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex flex-col justify-between border-e border-border bg-background transition-all duration-300 shrink-0 h-[calc(100vh-4rem)]",
          isCollapsed ? "w-20" : "w-64",
          "fixed top-16 bottom-0 start-0 z-50",
          isMobileOpen 
            ? "translate-x-0 rtl:translate-x-0 shadow-2xl" 
            : "-translate-x-full rtl:translate-x-full",
          "md:static md:translate-x-0 md:rtl:translate-x-0 md:top-auto md:bottom-auto md:z-auto md:shadow-none"
        )}
      >
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            {!isCollapsed && title && <div className="flex-1 truncate">{title}</div>}
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground transition-colors ms-auto cursor-pointer size-8"
              aria-label="Toggle Sidebar Collapse"
            >
              {isCollapsed ? (
                <ChevronRight className="size-4 rtl:rotate-180" />
              ) : (
                <ChevronLeft className="size-4 rtl:rotate-180" />
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground transition-colors ms-auto cursor-pointer size-8"
              aria-label="Close Sidebar"
            >
              <X className="size-4" />
            </Button>
          </div>

          <nav className="space-y-1.5">
            {items.map((item) => {
              const isActive = activeTab
                ? activeTab === item.id
                : activePath
                  ? activePath === item.href || activePath.startsWith(`${item.href}/`)
                  : false;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileOpen(false);
                    if (onItemClick) onItemClick(item);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg px-3.5 py-3 h-auto text-sm font-medium transition-colors text-start cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    {item.icon ? item.icon : <LayoutDashboard className="size-5 shrink-0" />}
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground font-normal">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {user && !isCollapsed && (
          <div className="p-4 border-t border-border bg-muted/40 mt-auto">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}