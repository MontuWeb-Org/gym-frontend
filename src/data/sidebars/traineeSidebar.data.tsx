// src/data/sidebars/traineeSidebar.data.tsx
import { LayoutDashboard, Dumbbell, User } from "lucide-react";
import type { SidebarItem } from "@/data/sidebar.types";
import { ROUTES } from "@/data/routes";

export const TRAINEE_SIDEBAR_DATA: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: ROUTES.TRAINEE.DASHBOARD,
    icon: <LayoutDashboard className="size-5" />,
  },
  {
    id: "workouts",
    label: "Workouts",
    href: ROUTES.TRAINEE.WORKOUTS,
    icon: <Dumbbell className="size-5" />,
  },
  {
    id: "profile",
    label: "Profile",
    href: ROUTES.TRAINEE.profile,
    icon: <User className="size-5" />,
  },
];