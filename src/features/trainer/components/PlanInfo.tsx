"use client";

import { useTranslations } from "next-intl";
import { CalendarDays, CheckCircle2, Clock, Dumbbell } from "lucide-react";
import { GetTraineeTimeline } from "../types/timeline.types";

interface PlanInfoProps {
  data: GetTraineeTimeline;
}

export function PlanInfo({ data }: PlanInfoProps) {
  const t = useTranslations("PlanTimeline");

  const { planTemplate, status, startedAt, currentWeekIdx, currentWorkoutIdx } = data;

  const totalWeeks = planTemplate.weekTemplates.length;
  const totalWorkouts = planTemplate.weekTemplates.reduce(
    (acc, week) => acc + week.workouts.length,
    0
  );
  const completedWorkouts = planTemplate.weekTemplates.reduce(
    (acc, week) =>
      acc +
      week.workouts.filter((w) => w.workoutLog?.status === "completed").length,
    0
  );

  const startedDate = new Date(startedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-500/10 text-green-600 border border-green-500/20 dark:text-green-400",
    COMPLETED: "bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400",
    PAUSED: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 dark:text-yellow-400",
    CANCELLED: "bg-destructive/10 text-destructive border border-destructive/20",
  };

  const statusLabel: Record<string, string> = {
    ACTIVE: t("statusLabels.active"),
    COMPLETED: t("statusLabels.completed"),
    PAUSED: t("statusLabels.paused"),
    CANCELLED: t("statusLabels.cancelled"),
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      {/* Header gradient strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />

      <div className="p-5 sm:p-6 space-y-4">
        {/* Title row */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">{planTemplate.name}</h2>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {planTemplate.description}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[status] ?? "bg-muted text-muted-foreground"}`}
          >
            {statusLabel[status] ?? status}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<CalendarDays className="h-4 w-4" />}
            label={t("info.startedAt")}
            value={startedDate}
          />
          <StatCard
            icon={<Dumbbell className="h-4 w-4" />}
            label={t("info.weeks")}
            value={String(totalWeeks)}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label={t("info.completed")}
            value={`${completedWorkouts} / ${totalWorkouts}`}
          />
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label={t("info.currentPosition")}
            value={t("info.weekWorkout", { week: currentWeekIdx, workout: currentWorkoutIdx })}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3 space-y-1.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
