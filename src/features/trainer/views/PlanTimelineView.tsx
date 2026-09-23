"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchTimeline,
  clearTimeline,
  startWorkout,
  skipWorkout,
} from "../store/timeline.slice";
import { PlanInfo } from "../components/PlanInfo";
import { WeekSection } from "../components/WeekSection";

interface PlanTimelineViewProps {
  planAssignmentId: number;
}

export function PlanTimelineView({ planAssignmentId }: PlanTimelineViewProps) {
  const t = useTranslations("PlanTimeline");
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Ref attached to the "current" workout card for smooth-scroll on load
  const currentWorkoutRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, error, reStartedWorkoutIds } = useAppSelector(
    (state) => state.timeline
  );

  useEffect(() => {
    dispatch(fetchTimeline(planAssignmentId));
    return () => {
      dispatch(clearTimeline());
    };
  }, [dispatch, planAssignmentId]);

  // Scroll to current workout once data is loaded
  useEffect(() => {
    if (data && currentWorkoutRef.current) {
      // Small delay to let the layout settle before scrolling
      const timer = setTimeout(() => {
        currentWorkoutRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const handleStart = async (workoutTemplateId: number) => {
    const result = await dispatch(
      startWorkout({ planAssignmentId, workoutTemplateId })
    );
    if (startWorkout.fulfilled.match(result)) {
      toast.success(t("toasts.startSuccess"));
    } else {
      toast.error(t("toasts.startError"));
    }
  };

  const handleSkip = async (workoutTemplateId: number) => {
    const result = await dispatch(
      skipWorkout({ planAssignmentId, workoutTemplateId })
    );
    if (skipWorkout.fulfilled.match(result)) {
      toast.success(t("toasts.skipSuccess"));
    } else {
      toast.error(t("toasts.skipError"));
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex h-64 w-full items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">{t("loading")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const sortedWeeks = [...data.planTemplate.weekTemplates].sort(
    (a, b) => a.sequenceNumber - b.sequenceNumber
  );

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Back navigation — uses browser history so it works from any context */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("back")}
        </button>
      </div>

      {/* Plan info header */}
      <PlanInfo data={data} />

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t("legend.title")}:
        </span>
        {(
          [
            { color: "bg-green-500", label: t("statuses.completed") },
            { color: "bg-blue-500", label: t("statuses.in_progress") },
            { color: "bg-yellow-500", label: t("statuses.skipped") },
            { color: "bg-muted-foreground/40", label: t("statuses.not_started") },
          ] as const
        ).map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {sortedWeeks.map((week) => (
          <WeekSection
            key={week.id}
            week={week}
            currentWeekIdx={data.currentWeekIdx}
            currentWorkoutIdx={data.currentWorkoutIdx}
            planAssignmentId={planAssignmentId}
            reStartedWorkoutIds={reStartedWorkoutIds}
            currentWorkoutRef={currentWorkoutRef}
            onStart={handleStart}
            onSkip={handleSkip}
          />
        ))}
      </div>
    </div>
  );
}
