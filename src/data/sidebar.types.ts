// src/data/sidebar.types.ts
import type { ReactNode } from "react";

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
}

export interface RoleSidebarConfig {
  title: ReactNode;
  items: SidebarItem[];
}