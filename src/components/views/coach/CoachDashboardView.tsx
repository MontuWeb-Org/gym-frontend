// src/components/views/coach/CoachDashboardView.tsx
"use client";

import { useTranslations } from "next-intl";
import { COACH_STATS, COACH_ACTIVITIES } from "@/data/mock/coachDashboard.data";
import { CoachStatsGrid } from "./components/CoachStatsGrid";
import { CoachActivityList } from "./components/CoachActivityList";

export default function CoachDashboardView() {
  const t = useTranslations("Coach.dashboard");

  const localizedStats = COACH_STATS.map((stat) => {
    const labelMap: Record<string, string> = {
      trainees: t("activeTrainees"),
      programs: t("activePrograms"),
      completion: t("completionRate"),
      revenue: t("monthlyRevenue"),
    };

    return {
      ...stat,
      label: labelMap[stat.id] ?? stat.label,
    };
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <CoachStatsGrid stats={localizedStats} />
      <CoachActivityList activities={COACH_ACTIVITIES} title={t("recentActivity")} />
    </div>
  );
}