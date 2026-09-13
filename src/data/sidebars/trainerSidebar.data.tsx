// src/data/sidebars/trainerSidebar.data.tsx
import { LayoutDashboard, Users, Dumbbell, FileText, CreditCard, Settings } from "lucide-react";
import type { SidebarItem } from "@/data/sidebar.types";
import { ROUTES } from "@/data/routes";

export const TRAINER_SIDEBAR_DATA: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: ROUTES.TRAINER.DASHBOARD,
    icon: <LayoutDashboard className="size-5" />,
    badge: "Trainer",
  },
  {
    id: "trainees",
    label: "Trainees",
    href: ROUTES.TRAINER.TRAINEES,
    icon: <Users className="size-5" />,
  },
  {
    id: "programs",
    label: "Programs",
    href: ROUTES.TRAINER.PROGRAMS, 
    icon: <Dumbbell className="size-5" />,
  },
  {
    id: "templates",
    label: "Templates",
    href: ROUTES.TRAINER.TEMPLATES,
    icon: <FileText className="size-5" />,
  },
  {
    id: "billing",
    label: "Billing",
    href: ROUTES.TRAINER.BILLING,
    icon: <CreditCard className="size-5" />,
  },
  {
    id: "settings",
    label: "Settings",
    href: ROUTES.TRAINER.SETTINGS,
    icon: <Settings className="size-5" />,
  },
];