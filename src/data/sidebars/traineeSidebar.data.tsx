// src/data/sidebars/traineeSidebar.data.tsx
import { Dumbbell, TrendingUp, Bell ,User } from "lucide-react";
import type { SidebarItem } from "@/data/sidebar.types";
import { ROUTES } from "@/data/routes";

export const TRAINEE_SIDEBAR_DATA: SidebarItem[] = [
  {
    id: "todays-workout",
    label: "Today's Workout",
    href: ROUTES.TRAINEE.TODAYS_WORKOUT,
    icon: <Dumbbell className="size-5" />,
  },  
  {
    id: "progress",
    label: "Progress",
    href: ROUTES.TRAINEE.Progress,
    icon: <TrendingUp className="size-5" />,
  },
  {
    id: "notifications",
    label: "Notifications",
    href: ROUTES.TRAINEE.Notifications,
    icon: <Bell className="size-5" />,
  },
  {
    id: "profile",
    label: "Profile",
    href: ROUTES.TRAINEE.profile,
    icon: <User className="size-5" />,
  },
];