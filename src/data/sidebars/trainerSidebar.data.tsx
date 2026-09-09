
import { LayoutDashboard, Users, Dumbbell, FileText, CreditCard, Settings } from "lucide-react";
import type { SidebarItem } from "@/data/sidebar.types";
import TrainerDashboardView from "@/components/views/trainer/TrainerDashboardView";
import TraineesView from "@/features/trainer/views/TaineeManagement";
import ProgramsView from "@/components/views/trainer/ProgramsView";
import TemplatesView from "@/components/views/trainer/TemplatesView";
import BillingView from "@/components/views/trainer/BillingView";
import TrainerSettingsView from "@/components/views/trainer/TrainerSettingsView";

export const TRAINER_SIDEBAR_DATA: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "", 
    icon: <LayoutDashboard className="size-5" />,
    badge: "Trainer",
    component: TrainerDashboardView,
  },
  {
    id: "trainees",
    label: "Trainees",
    href: "trainees",
    icon: <Users className="size-5" />,
    component: TraineesView,
  },
  {
    id: "programs",
    label: "Programs",
    href: "programs",
    icon: <Dumbbell className="size-5" />,
    component: ProgramsView,
  },
  {
    id: "templates",
    label: "Templates",
    href: "templates",
    icon: <FileText className="size-5" />,
    component: TemplatesView,
  },
  {
    id: "billing",
    label: "Billing",
    href: "billing",
    icon: <CreditCard className="size-5" />,
    component: BillingView,
  },
  {
    id: "settings",
    label: "Settings",
    href: "settings",
    icon: <Settings className="size-5" />,
    component: TrainerSettingsView,
  },
];