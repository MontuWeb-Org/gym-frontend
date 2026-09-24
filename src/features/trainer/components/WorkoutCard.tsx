"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Play,
  SkipForward,
  Clock,
  CheckCircle2,
  AlertCircle,
  CircleDot,
  CircleOff,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkoutTemplate } from "../types/timeline.types";
import { ROUTES } from "@/data/routes";

type DisplayStatus = "completed" | "skipped" | "in_progress" | "current" | "not_started";

interface WorkoutCardProps {
  workout: WorkoutTemplate;
  displayStatus: DisplayStatus;
  planAssignmentId: number;
  onStart: () => Promise<void>;
  onSkip: () => Promise<void>;
  isReStarted?: boolean;
}

const STATUS_CONFIG: Record<
  DisplayStatus,
  {
    border: string;
    badge: string;
    badgeText: string;
    icon: React.ReactNode;
  }
> = {
  completed: {
    border: "border-green-500/70 dark:border-green-500/50",
    badge: "bg-green-500 text-white",
    badgeText: "completed",
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  },
  skipped: {
    border: "border-yellow-500/70 dark:border-yellow-500/50",
    badge: "bg-yellow-500 text-white",
    badgeText: "skipped",
    icon: <CircleOff className="h-4 w-4 text-yellow-500" />,
  },
  in_progress: {
    border: "border-blue-500/70 dark:border-blue-500/50",
    badge: "bg-blue-500 text-white",
    badgeText: "in_progress",
    icon: <CircleDot className="h-4 w-4 text-blue-500" />,
  },
  current: {
    border: "border-blue-500 dark:border-blue-400",
    badge: "bg-blue-500 text-white",
    badgeText: "current",
    icon: <CircleDot className="h-4 w-4 text-blue-500" />,
  },
  not_started: {
    border: "border-border",
    badge: "bg-muted text-muted-foreground",
    badgeText: "not_started",
    icon: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
  },
};

export function WorkoutCard({
  workout,
  displayStatus,
  planAssignmentId,
  onStart,
  onSkip,
  isReStarted = false,
}: WorkoutCardProps) {
  const t = useTranslations("PlanTimeline");
  const [isStarting, setIsStarting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const config = STATUS_CONFIG[displayStatus];

  // If a skipped workout was re-started, override to blue
  const effectiveConfig =
    isReStarted && displayStatus === "skipped"
      ? STATUS_CONFIG["in_progress"]
      : config;

  const isCurrent = displayStatus === "current";
  const isSkipped = displayStatus === "skipped";
  const isInProgress = displayStatus === "in_progress";
  const showStart = isCurrent || isSkipped || isInProgress;
  const showSkip = isCurrent || isInProgress || isReStarted;

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await onStart();
    } finally {
      setIsStarting(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      await onSkip();
    } finally {
      setIsSkipping(false);
    }
  };

  const workoutDetailUrl = ROUTES.PLANS.WORKOUT_TEMPLATE_DETAIL(
    String(planAssignmentId),
    String(workout.id)
  );

  return (
    <div
      className={`relative rounded-xl border-2 bg-card p-4 shadow-xs transition-all duration-200 hover:shadow-sm ${effectiveConfig.border}`}
    >
      {/* Top-right status badge */}
      <div className="absolute end-3 top-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${effectiveConfig.badge}`}
        >
          {effectiveConfig.icon}
          {t(`statuses.${effectiveConfig.badgeText}`)}
        </span>
      </div>

      {/* Main content */}
      <div className="space-y-3 pe-28">
        {/* Workout title - clickable link */}
        <Link
          href={workoutDetailUrl}
          className="group block"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {workout.sequenceNumber}
            </span>
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {workout.name}
            </h3>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        {/* Workout log data */}
        {workout.workoutLog && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {workout.workoutLog.durationMinutes} {t("log.minutes")}
            </span>
            <Link
              href={ROUTES.PLANS.WORKOUT_LOG_DETAIL(String(workout.workoutLog.id))}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              {t("log.viewLog")}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {(showStart || showSkip) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {showStart && (
            <Button
              size="sm"
              className="gap-1.5 bg-blue-500 text-white hover:bg-blue-600"
              onClick={handleStart}
              disabled={isStarting || isSkipping}
              id={`start-workout-${workout.id}`}
            >
              {isStarting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {isSkipped && !isReStarted
                ? t("actions.startAgain")
                : isCurrent && !workout.workoutLog
                ? t("actions.start")
                : t("actions.resume")}
            </Button>
          )}
          {showSkip && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10 hover:border-yellow-500 dark:text-yellow-400"
              onClick={handleSkip}
              disabled={isStarting || isSkipping}
              id={`skip-workout-${workout.id}`}
            >
              {isSkipping ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <SkipForward className="h-3.5 w-3.5" />
              )}
              {t("actions.skip")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
