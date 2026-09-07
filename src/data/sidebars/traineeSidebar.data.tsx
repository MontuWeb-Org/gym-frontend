import { LayoutDashboard, Dumbbell, Settings } from "lucide-react";
import type { SidebarItem } from "@/data/sidebar.types";
import TraineeDashboardView from "@/components/views/trainee/TraineeDashboardView";
import WorkoutsView from "@/components/views/trainee/WorkoutsView";
import TraineeSettingsView from "@/components/views/trainee/TraineeSettingsView";

export const TRAINEE_SIDEBAR_DATA: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "", 
    icon: <LayoutDashboard className="size-5" />,
    component: TraineeDashboardView,
  },
  {
    id: "workouts",
    label: "Workouts",
    href: "workouts",
    icon: <Dumbbell className="size-5" />,
    component: WorkoutsView,
  },
  {
    id: "settings",
    label: "Settings",
    href: "settings",
    icon: <Settings className="size-5" />,
    component: TraineeSettingsView,
  },
];