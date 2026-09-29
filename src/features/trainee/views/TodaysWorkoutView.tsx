"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { traineePlanService } from "../services/plan.service";
import { TraineeActivePlan } from "../types/plan.types";
import { WorkoutLoggingView } from "./WorkoutLoggingView";

export default function TodaysWorkoutView() {
  const t = useTranslations("WorkoutLog");
  const searchParams = useSearchParams();
  const requestedWorkoutId = Number(searchParams.get("workoutId"));
  const [plan, setPlan] = useState<TraineeActivePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    traineePlanService
      .getActivePlans()
      .then((plans) => {
        const activePlan = plans[0] ?? null;
        if (!activePlan || !Number.isInteger(requestedWorkoutId)) {
          setPlan(activePlan);
          return;
        }

        setPlan({
          ...activePlan,
          currentWorkout: activePlan.currentWorkout
            ? {
                ...activePlan.currentWorkout,
                workoutTemplateId: requestedWorkoutId,
              }
            : {
                workoutTemplateId: requestedWorkoutId,
                name: t("selectedWorkout"),
                sequenceNumber: 0,
                weekSequenceNumber: 0,
              },
        });
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [requestedWorkoutId, t]);

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        {t("loading")}
      </div>
    );
  }

  if (error) return <p className="text-sm text-destructive">{t("errors.loadWorkout")}</p>;
  if (!plan) return <p className="text-sm text-muted-foreground">{t("empty")}</p>;

  return <WorkoutLoggingView plan={plan} />;
}