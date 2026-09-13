// src/data/sidebars/adminSidebar.data.tsx
import { LayoutDashboard, Users, Calendar, Dumbbell, User, Settings } from "lucide-react";
import type { SidebarItem } from "@/data/sidebar.types";
import { ROUTES } from "@/data/routes";

export const ADMIN_SIDEBAR_DATA: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: ROUTES.ADMIN.DASHBOARD,
    icon: <LayoutDashboard className="size-5" />,
  },
  {
    id: "members",
    label: "Members",
    href: ROUTES.ADMIN.MEMBERS,
    icon: <Users className="size-5" />,
  },
  {
    id: "classes",
    label: "Classes",
    href: ROUTES.ADMIN.CLASSES,
    icon: <Calendar className="size-5" />,
  },
  {
    id: "workouts",
    label: "Workouts",
    href: ROUTES.ADMIN.WORKOUTS,
    icon: <Dumbbell className="size-5" />,
  },
  {
    id: "profile",
    label: "Profile",
    href: ROUTES.ADMIN.PROFILE,
    icon: <User className="size-5" />,
  },
  {
    id: "settings",
    label: "Settings",
    href: ROUTES.ADMIN.SETTINGS,
    icon: <Settings className="size-5" />,
  },
];