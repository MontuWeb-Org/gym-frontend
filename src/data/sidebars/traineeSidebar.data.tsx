import React from "react";
import {
  LayoutDashboard,
  Calendar,
  Dumbbell,
  User,
  Activity,
} from "lucide-react";
import type { SidebarItem } from "../sidebar.types";

import TraineePage from "@/app/[locale]/(protected)/trainee/page";
import ClassesPage from "@/app/[locale]/(protected)/classes/page";
import WorkoutsPage from "@/app/[locale]/(protected)/workouts/page";
import ProfilePage from "@/app/[locale]/(protected)/profile/page";

export const TRAINEE_SIDEBAR_TITLE: React.ReactNode = (
  <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary border-b border-border mb-2">
    <Activity className="size-4 text-primary" />
    <span>Trainee Portal</span>
  </div>
);

export const TRAINEE_SIDEBAR_DATA: SidebarItem[] = [
  {
    id: "trainee-dashboard",
    label: "Dashboard",
    href: "/trainee",
    icon: <LayoutDashboard className="size-5" />,
    component: TraineePage,
  },
  {
    id: "trainee-classes",
    label: "Booked Classes",
    href: "/classes",
    icon: <Calendar className="size-5" />,
    component: ClassesPage,
  },
  {
    id: "trainee-workouts",
    label: "My Workouts",
    href: "/workouts",
    icon: <Dumbbell className="size-5" />,
    component: WorkoutsPage,
  },
  {
    id: "trainee-profile",
    label: "My Profile",
    href: "/profile",
    icon: <User className="size-5" />,
    component: ProfilePage,
  },
];
