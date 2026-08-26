import {
  LayoutDashboard,
  Calendar,
  Users,
  Dumbbell,
  User,
  Settings,
  LogIn,
  Home,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  dashboard: LayoutDashboard,
  classes: Calendar,
  members: Users,
  workouts: Dumbbell,
  profile: User,
  settings: Settings,
  auth: LogIn,
};

export const LAYOUT_CONFIG = {
  brand: {
    titleKey: "brandName",
  },
  ariaLabels: {
    toggleSidebar: "toggleSidebar",
    openMenu: "openMenu",
    closeMenu: "closeMenu",
  },
} as const;