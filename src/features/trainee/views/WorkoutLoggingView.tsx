"use client";

import { SyntheticEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  completeWorkoutSession,
  resetRestTimer,
  setActiveSet,
  startRestTimer,
  startWorkoutSession,
  updateSet,
} from "../store/workoutLog.slice";
import { traineePlanService } from "../services/plan.service";
import {
  completeWorkout,
  logExercise,
  startWorkout,
} from "../services/workoutLog.service";
import { ExerciseLogDraft, SetLogDraft, WorkoutSession } from "../types/workoutLog.types";
import { RestTimer } from "../components/RestTimer";
import { TraineeActivePlan, WorkoutExerciseDetails } from "../types/plan.types";
import { syncWorkoutQueue } from "@/lib/syncWorkoutQueue";

function makeSet(sequenceNumber: number, reps: number, weight: number): SetLogDraft {
  const now = new Date().toISOString();
  return {
    reps,
    weight,
    restTimeSeconds: 0,
    startedAt: now,
    endedAt: now,
    sequenceNumber,
  };
}

function parseDefaultReps(reps: string): number {
  const match = /\d+/.exec(reps);
  return match ? Number(match[0]) : 0;
}

interface WorkoutLoggingViewProps {
  plan: TraineeActivePlan;
}

export function WorkoutLoggingView({ plan }: Readonly<WorkoutLoggingViewProps>) {
  const t = useTranslations("WorkoutLog");
  const dispatch = useAppDispatch();
  const workoutState = useAppSelector((state) => state.workoutLog);
  const [details, setDetails] = useState<WorkoutExerciseDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine
  );

  const workout = plan.currentWorkout;
  const activeExercise = workoutState.session?.exercises[workoutState.activeExerciseIndex];
  const activeExerciseDetails = details[workoutState.activeExerciseIndex];
  const activeSet = workoutState.session?.exercises[workoutState.activeExerciseIndex]?.sets[
    workoutState.activeSetIndex
  ];

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (!workout) return;
    let cancelled = false;
    traineePlanService
      .getWorkoutDetails(plan.planId, workout.workoutTemplateId)
      .then((result) => {
        if (!cancelled) setDetails(result);
      })
      .catch(() => {
        if (!cancelled) toast.error(t("errors.loadWorkout"));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [plan.planId, t, workout]);

  useEffect(() => {
    const handleOnline = () => {
      void syncWorkoutQueue();
    };
    window.addEventListener("online", handleOnline);
    if (navigator.onLine) handleOnline();
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  if (!workout) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        {t("loading")}
      </div>
    );
  }

  if (workoutState.status === "completed") {
    return (
      <Card>
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <CheckCircle2 className="size-10 text-green-600" />
          <h1 className="text-xl font-bold">{t("complete.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("complete.description")}</p>
        </CardContent>
      </Card>
    );
  }

  if (workoutState.status === "idle") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{workout.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("ready", { count: details.length })}</p>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            disabled={
              isStarting ||
              details.length === 0 ||
              details.some((exercise) => exercise.id === undefined)
            }
            onClick={handleStart}
          >
            {isStarting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {t("actions.start")}
          </Button>
          {details.some((exercise) => exercise.id === undefined) ? (
            <p className="mt-3 text-sm text-destructive">
              {t("errors.missingTemplateIds")}
            </p>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  async function handleStart() {
    if (
      !workout ||
      details.length === 0 ||
      details.some((exercise) => exercise.id === undefined)
    ) {
      toast.error(t("errors.missingTemplateIds"));
      return;
    }
    setIsStarting(true);
    const tempId = crypto.randomUUID();
    const startedAt = new Date().toISOString();
    const sessionExercises = details.map((exercise) => ({
      tempId: crypto.randomUUID(),
      workoutExerciseTemplateId: exercise.id as number,
      sequenceNumber: exercise.sequenceNumber,
      planAssignmentId: plan.planId,
      sets: Array.from({ length: exercise.defaultSets }, (_, index) =>
        makeSet(index + 1, parseDefaultReps(exercise.defaultReps), exercise.defaultWeight)
      ),
      startedAt,
      endedAt: startedAt,
      synced: false,
    }));
    const session: WorkoutSession = {
      tempId,
      workoutLogId: await startWorkout({
        tempId,
        workoutLogId: null,
        planAssignmentId: plan.planId,
        workoutTemplateId: workout.workoutTemplateId,
        startedAt,
        endedAt: null,
        status: "in-progress",
        pendingStart: !navigator.onLine,
        exercises: sessionExercises,
      }),
      planAssignmentId: plan.planId,
      workoutTemplateId: workout.workoutTemplateId,
      startedAt,
      endedAt: null,
      status: "in-progress",
      pendingStart: !navigator.onLine,
      exercises: sessionExercises,
    };
    dispatch(
      startWorkoutSession({
        session,
        exercises: details.map((exercise) => ({
          workoutExerciseTemplateId: exercise.id as number,
          sequenceNumber: exercise.sequenceNumber,
          recommendedRestSeconds: exercise.defaultRestTimeSeconds,
          setCount: exercise.defaultSets,
        })),
      })
    );
    setIsStarting(false);
  }

  async function handleNextSet(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeExercise || !activeSet || !activeExerciseDetails || !workoutState.session) return;

    const endedAt = new Date().toISOString();
    const formData = new FormData(event.currentTarget);
    const updatedSet: SetLogDraft = {
      ...activeSet,
      reps: Number(formData.get("reps")),
      weight: Number(formData.get("weight")),
      endedAt,
    };
    dispatch(
      updateSet({
        exerciseIndex: workoutState.activeExerciseIndex,
        setIndex: workoutState.activeSetIndex,
        values: updatedSet,
      })
    );

    dispatch(startRestTimer({ recommendedSeconds: activeExerciseDetails.defaultRestTimeSeconds }));
  }

  const setNumber = workoutState.activeSetIndex + 1;
  const totalSets = activeExercise?.sets.length ?? 0;

  function finishRest(elapsedSeconds: number) {
    void finishRestAndAdvance(elapsedSeconds);
  }

  async function finishRestAndAdvance(elapsedSeconds: number) {
    if (!activeExercise || !activeExerciseDetails || !workoutState.session) return;

    const exerciseIndex = workoutState.activeExerciseIndex;
    const setIndex = workoutState.activeSetIndex;
    const updatedSet = {
      ...activeExercise.sets[setIndex],
      restTimeSeconds: Math.max(0, elapsedSeconds),
    };
    dispatch(updateSet({ exerciseIndex, setIndex, values: updatedSet }));
    dispatch(resetRestTimer());

    const isLastSet = setIndex === activeExercise.sets.length - 1;
    if (!isLastSet) {
      dispatch(setActiveSet({ exerciseIndex, setIndex: setIndex + 1 }));
      return;
    }

    const exerciseLog: ExerciseLogDraft = {
      ...activeExercise,
      sets: activeExercise.sets.map((set, index) =>
        index === setIndex ? updatedSet : set
      ),
      endedAt: new Date().toISOString(),
      synced: false,
    };
    await logExercise(workoutState.session.tempId, workoutState.session.workoutLogId, exerciseLog);

    const isLastExercise = exerciseIndex === details.length - 1;
    if (!isLastExercise) {
      dispatch(setActiveSet({ exerciseIndex: exerciseIndex + 1, setIndex: 0 }));
      return;
    }

    const workoutEndedAt = new Date().toISOString();
    await completeWorkout(
      workoutState.session.tempId,
      workoutState.session.workoutLogId,
      workoutEndedAt
    );
    dispatch(completeWorkoutSession({ endedAt: workoutEndedAt }));
  }

  if (workoutState.timer.status !== "idle") {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-sm text-muted-foreground">{workout.name}</p>
          <h1 className="text-2xl font-bold">{activeExerciseDetails?.exerciseName}</h1>
        </div>
        {!isOnline ? (
          <span className="inline-flex items-center gap-1 text-xs text-amber-700">
            <WifiOff className="size-4" /> {t("offline")}
          </span>
        ) : null}
        <RestTimer onFinish={finishRest} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{workout.name}</p>
          <h1 className="text-2xl font-bold">{activeExerciseDetails?.exerciseName}</h1>
        </div>
        {!isOnline ? (
          <span className="inline-flex items-center gap-1 text-xs text-amber-700">
            <WifiOff className="size-4" /> {t("offline")}
          </span>
        ) : null}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{activeExerciseDetails?.exerciseName}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {activeExerciseDetails?.difficulty}
            {activeExerciseDetails?.equipment.length
              ? ` · ${activeExerciseDetails.equipment.join(", ")}`
              : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">{activeExerciseDetails?.instructions}</p>
          <p className="font-medium">
            {t("prescription", {
              reps: activeExerciseDetails?.defaultReps ?? "",
              weight: activeExerciseDetails?.defaultWeight ?? 0,
            })}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("set", { current: setNumber, total: totalSets })}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("rest.recommended", { seconds: activeExerciseDetails?.defaultRestTimeSeconds ?? 0 })}
          </p>
        </CardHeader>
        <CardContent>
          <form
            key={`${workoutState.activeExerciseIndex}-${workoutState.activeSetIndex}`}
            className="space-y-4"
            onSubmit={handleNextSet}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                {t("fields.reps")}
                <Input required min={1} name="reps" type="number" defaultValue={activeSet?.reps || ""} />
              </label>
              <label className="space-y-2 text-sm font-medium">
                {t("fields.weight")}
                <Input required min={0} name="weight" step="0.5" type="number" defaultValue={activeSet?.weight || ""} />
              </label>
            </div>
            <Button type="submit" className="w-full">
              {setNumber === totalSets && workoutState.activeExerciseIndex === details.length - 1
                ? t("actions.finish")
                : t("actions.next")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
