import React from "react";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  FileText,
  CreditCard,
  Settings,
  Award,
} from "lucide-react";
import type { SidebarItem } from "../sidebar.types";

// Coach-specific page components — each section has its own dedicated page
import CoachPage from "@/app/[locale]/(protected)/coach/page";
import CoachTraineesPage from "@/app/[locale]/(protected)/coach/trainees/page";
import CoachProgramsPage from "@/app/[locale]/(protected)/coach/programs/page";
import CoachTemplatesPage from "@/app/[locale]/(protected)/coach/templates/page";
import CoachBillingPage from "@/app/[locale]/(protected)/coach/billing/page";
import CoachSettingsPage from "@/app/[locale]/(protected)/coach/settings/page";

export const COACH_SIDEBAR_TITLE: React.ReactNode = (
  <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary border-b border-border mb-2">
    <Award className="size-4 text-primary" />
    <span>Coach Hub</span>
  </div>
);

export const COACH_SIDEBAR_DATA: SidebarItem[] = [
  {
    id: "coach-dashboard",
    label: "Dashboard",
    href: "/coach",
    icon: <LayoutDashboard className="size-5" />,
    badge: "Coach",
    component: CoachPage,
  },
  {
    id: "coach-trainees",
    label: "Trainees",
    href: "/coach/trainees",
    icon: <Users className="size-5" />,
    component: CoachTraineesPage,
  },
  {
    id: "coach-programs",
    label: "Programs",
    href: "/coach/programs",
    icon: <Dumbbell className="size-5" />,
    component: CoachProgramsPage,
  },
  {
    id: "coach-templates",
    label: "Templates",
    href: "/coach/templates",
    icon: <FileText className="size-5" />,
    component: CoachTemplatesPage,
  },
  {
    id: "coach-billing",
    label: "Billing",
    href: "/coach/billing",
    icon: <CreditCard className="size-5" />,
    component: CoachBillingPage,
  },
  {
    id: "coach-settings",
    label: "Settings",
    href: "/coach/settings",
    icon: <Settings className="size-5" />,
    component: CoachSettingsPage,
  },
];
