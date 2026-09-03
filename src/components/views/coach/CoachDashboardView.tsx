"use client";

import { useTranslations } from "next-intl";
import { CoachStatsGrid } from "./components/CoachStatsGrid";
import { CoachActivityList } from "./components/CoachActivityList";

export default function CoachDashboardView() {
  const t = useTranslations("Coach.dashboard");

  // Aligned with StatItem interface expectations (making icon required or handling it correctly)
  const stats: Array<{ id: string; label: string; value: string; change?: string; icon: React.ReactNode }> = [];
  const activities: Array<{ id: string; title: string; description: string; time: string; timestamp?: string; type?: string }> = [];

  const localizedStats = stats.map((stat) => {
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
      <CoachStatsGrid stats={localizedStats} />
      <CoachActivityList activities={activities} title={t("recentActivity")} />
    </div>
  );
}