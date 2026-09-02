// src/data/sidebars/coachSidebar.data.ts
import { LayoutDashboard, Users, Dumbbell, FileText, CreditCard, Settings } from "lucide-react";
import type { SidebarItem } from "@/data/sidebar.types";
import CoachDashboardView from "@/components/views/coach/CoachDashboardView";
import TraineesView from "@/components/views/coach/TraineesView";
import ProgramsView from "@/components/views/coach/ProgramsView";
import TemplatesView from "@/components/views/coach/TemplatesView";
import BillingView from "@/components/views/coach/BillingView";
import CoachSettingsView from "@/components/views/coach/CoachSettingsView";

export const COACH_SIDEBAR_DATA: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/coach",
    icon: <LayoutDashboard className="size-5" />,
    badge: "Coach",
    component: CoachDashboardView,
  },
  {
    id: "trainees",
    label: "Trainees",
    href: "/coach/trainees",
    icon: <Users className="size-5" />,
    component: TraineesView,
  },
  {
    id: "programs",
    label: "Programs",
    href: "/coach/programs",
    icon: <Dumbbell className="size-5" />,
    component: ProgramsView,
  },
  {
    id: "templates",
    label: "Templates",
    href: "/coach/templates",
    icon: <FileText className="size-5" />,
    component: TemplatesView,
  },
  {
    id: "billing",
    label: "Billing",
    href: "/coach/billing",
    icon: <CreditCard className="size-5" />,
    component: BillingView,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/coach/settings",
    icon: <Settings className="size-5" />,
    component: CoachSettingsView,
  },
];