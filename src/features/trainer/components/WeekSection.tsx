"use client";

import { useTranslations } from "next-intl";
import { WorkoutCard } from "./WorkoutCard";
import { WeekTemplate } from "../types/timeline.types";

type DisplayStatus = "completed" | "skipped" | "in_progress" | "current" | "not_started";

interface WeekSectionProps {
  week: WeekTemplate;
  currentWeekIdx: number;
  currentWorkoutIdx: number;
  planAssignmentId: number;
  reStartedWorkoutIds: number[];
  currentWorkoutRef?: React.RefObject<HTMLDivElement | null>;
  onStart: (workoutTemplateId: number) => Promise<void>;
  onSkip: (workoutTemplateId: number) => Promise<void>;
}

export function WeekSection({
  week,
  currentWeekIdx,
  currentWorkoutIdx,
  planAssignmentId,
  reStartedWorkoutIds,
  currentWorkoutRef,
  onStart,
  onSkip,
}: WeekSectionProps) {
  const t = useTranslations("PlanTimeline");

  const isCurrentWeek = week.sequenceNumber === currentWeekIdx;

  function resolveDisplayStatus(
    workout: WeekTemplate["workouts"][0]
  ): DisplayStatus {
    if (workout.workoutLog) {
      const rawStatus = workout.workoutLog.status;
      const s = rawStatus ? String(rawStatus).toLowerCase().trim() : "";
      if (s === "completed") return "completed";
      if (s === "skipped") return "skipped";
      if (s === "in_progress" || s === "inprogress") return "in_progress";

      // Fallback: If a workout log exists with duration or ID, and status isn't skipped/in_progress, it is completed
      if (
        (workout.workoutLog.durationMinutes !== undefined &&
          workout.workoutLog.durationMinutes > 0) ||
        workout.workoutLog.id
      ) {
        return "completed";
      }
    }

    // No log: check if this is the "current" target workout
    if (isCurrentWeek && workout.sequenceNumber === currentWorkoutIdx) {
      return "current";
    }

    return "not_started";
  }

  return (
    <div className="space-y-1.5">
      {/* Week header */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
            isCurrentWeek
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {t("week", { number: week.sequenceNumber })}
        </div>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Workout cards - small gap between same-week workouts */}
      <div className="space-y-2 ps-2">
        {week.workouts.map((workout) => {
          const displayStatus = resolveDisplayStatus(workout);
          const isReStarted = reStartedWorkoutIds.includes(workout.id);
          const isCurrent = displayStatus === "current";

          return (
            <div key={workout.id} ref={isCurrent ? currentWorkoutRef : undefined}>
              <WorkoutCard
                workout={workout}
                displayStatus={displayStatus}
                planAssignmentId={planAssignmentId}
                onStart={() => onStart(workout.id)}
                onSkip={() => onSkip(workout.id)}
                isReStarted={isReStarted}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
