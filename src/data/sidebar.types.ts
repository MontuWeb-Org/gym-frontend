import type { ComponentType } from "react";
import type { ReactNode } from "react";

export interface SidebarItem {
  id: string;
  label: ReactNode;
  href: string;
  icon?: ReactNode;
  badge?: ReactNode;
  /**
   * The view component to render in the main content area when this item is selected.
   * This makes AppLayout fully data-driven — no switch/case needed there.
   */
  component?: ComponentType;
}

export interface RoleSidebarConfig {
  title: ReactNode;
  items: SidebarItem[];
  /** Default component to render when no item is active (fallback). */
  defaultComponent?: ComponentType;
}
