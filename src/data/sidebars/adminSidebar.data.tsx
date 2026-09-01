import React from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Dumbbell,
  User,
  Settings,
  ShieldAlert,
} from "lucide-react";
import type { SidebarItem } from "../sidebar.types";

// Page components — imported here so the data file owns the mapping, not AppLayout
import AdminPage from "@/app/[locale]/(protected)/admin/page";
import MembersPage from "@/app/[locale]/(protected)/members/page";
import ClassesPage from "@/app/[locale]/(protected)/classes/page";
import WorkoutsPage from "@/app/[locale]/(protected)/workouts/page";
import ProfilePage from "@/app/[locale]/(protected)/profile/page";
import SettingsPage from "@/app/[locale]/(protected)/settings/page";

export const ADMIN_SIDEBAR_TITLE: React.ReactNode = (
  <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary border-b border-border mb-2">
    <ShieldAlert className="size-4 text-primary" />
    <span>Admin Management</span>
  </div>
);

export const ADMIN_SIDEBAR_DATA: SidebarItem[] = [
  {
    id: "admin-dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="size-5" />,
    badge: "Admin",
    component: AdminPage,
  },
  {
    id: "admin-members",
    label: "Members Directory",
    href: "/members",
    icon: <Users className="size-5" />,
    component: MembersPage,
  },
  {
    id: "admin-classes",
    label: "Class Schedules",
    href: "/classes",
    icon: <Calendar className="size-5" />,
    component: ClassesPage,
  },
  {
    id: "admin-workouts",
    label: "Workout Plans",
    href: "/workouts",
    icon: <Dumbbell className="size-5" />,
    component: WorkoutsPage,
  },
  {
    id: "admin-profile",
    label: "My Profile",
    href: "/profile",
    icon: <User className="size-5" />,
    component: ProfilePage,
  },
  {
    id: "admin-settings",
    label: "System Settings",
    href: "/settings",
    icon: <Settings className="size-5" />,
    component: SettingsPage,
  },
];
