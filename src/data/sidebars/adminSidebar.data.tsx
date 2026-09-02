// src/data/sidebars/adminSidebar.data.tsx
import { LayoutDashboard, Users, Calendar, Dumbbell, User, Settings } from "lucide-react";
import type { SidebarItem } from "@/data/sidebar.types";
import PlaceholderView from "../../components/views/PlaceholderView";

export const ADMIN_SIDEBAR_DATA: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="size-5" />,
    component: PlaceholderView,
  },
  {
    id: "members",
    label: "Members",
    href: "/admin/members",
    icon: <Users className="size-5" />,
    component: PlaceholderView,
  },
  {
    id: "classes",
    label: "Classes",
    href: "/admin/classes",
    icon: <Calendar className="size-5" />,
    component: PlaceholderView,
  },
  {
    id: "workouts",
    label: "Workouts",
    href: "/admin/workouts",
    icon: <Dumbbell className="size-5" />,
    component: PlaceholderView,
  },
  {
    id: "profile",
    label: "Profile",
    href: "/admin/profile",
    icon: <User className="size-5" />,
    component: PlaceholderView,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/admin/settings",
    icon: <Settings className="size-5" />,
    component: PlaceholderView,
  },
];