import type { ComponentType } from "react";
import type { ReactNode } from "react";

export interface SidebarItem {
 id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
  /**
   * The view component to render in the main content area when this item is selected.
   */
  component?: ComponentType;
}

export interface RoleSidebarConfig {
  title: ReactNode;
  items: SidebarItem[];
  /** Default component to render when no item is active (fallback). */
  defaultComponent?: ComponentType;
}
