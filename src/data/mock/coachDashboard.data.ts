import { Users, Dumbbell, TrendingUp, DollarSign } from "lucide-react";
import React from "react";

export interface StatItem {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
}

export interface ActivityItem {
  id: string;
  description: string;
  time: string;
}

export const COACH_STATS: StatItem[] = [
  {
    id: "trainees",
    label: "Active Trainees",
    value: "24",
    icon: React.createElement(Users, { className: "size-5" }),
  },
  {
    id: "programs",
    label: "Active Programs",
    value: "12",
    icon: React.createElement(Dumbbell, { className: "size-5" }),
  },
  {
    id: "completion",
    label: "Completion Rate",
    value: "88%",
    icon: React.createElement(TrendingUp, { className: "size-5" }),
  },
  {
    id: "revenue",
    label: "Monthly Revenue",
    value: "$3,420",
    icon: React.createElement(DollarSign, { className: "size-5" }),
  },
];

export const COACH_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    description: "John Doe completed Upper Body Workout A",
    time: "2 hours ago",
  },
  {
    id: "2",
    description: "Sarah Smith updated her weight log",
    time: "5 hours ago",
  },
  {
    id: "3",
    description: "Michael Brown subscribed to Pro Plan",
    time: "Yesterday",
  },
];