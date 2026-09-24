"use client";

import { useEffect } from "react";
import { Pause, Play, TimerReset } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  pauseRestTimer,
  resetRestTimer,
  resumeRestTimer,
  updateRestTimer,
} from "../store/workoutLog.slice";

function formatSeconds(totalSeconds: number) {
  const sign = totalSeconds < 0 ? "-" : "";
  const absoluteSeconds = Math.abs(totalSeconds);
  const minutes = Math.floor(absoluteSeconds / 60);
  const seconds = absoluteSeconds % 60;
  return `${sign}${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface RestTimerProps {
  onFinish: (elapsedSeconds: number) => void | Promise<void>;
}

export function RestTimer({ onFinish }: Readonly<RestTimerProps>) {
  const t = useTranslations("WorkoutLog");
  const dispatch = useAppDispatch();
  const timer = useAppSelector((state) => state.workoutLog.timer);

  useEffect(() => {
    if (timer.status !== "running" || !timer.startedAt) return;

    const update = () => {
      const elapsedSeconds = Math.floor(
        (Date.now() - new Date(timer.startedAt as string).getTime()) / 1000
      );
      dispatch(updateRestTimer({ elapsedSeconds }));
    };

    update();
    const intervalId = window.setInterval(update, 1000);
    return () => window.clearInterval(intervalId);
  }, [dispatch, timer.startedAt, timer.status]);

  if (timer.status === "idle") return null;

  const remainingSeconds = timer.recommendedSeconds - timer.elapsedSeconds;
  const isRecommendedRestComplete = remainingSeconds <= 0;
  let timerAction = null;
  if (timer.status === "running") {
    timerAction = (
      <Button type="button" size="sm" variant="outline" onClick={() => dispatch(pauseRestTimer({}))}>
        <Pause className="mr-2 size-4" />
        {t("rest.pause")}
      </Button>
    );
  } else if (timer.status === "paused") {
    timerAction = (
      <Button type="button" size="sm" variant="outline" onClick={() => dispatch(resumeRestTimer({}))}>
        <Play className="mr-2 size-4" />
        {t("rest.resume")}
      </Button>
    );
  }

  return (
    <section className="rounded-xl border border-primary/20 bg-primary/5 p-4" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{t("rest.title")}</p>
          <p className="text-xs text-muted-foreground">
            {t("rest.recommended", { seconds: timer.recommendedSeconds })}
          </p>
        </div>
        <p className="font-mono text-2xl font-bold tabular-nums text-primary">
          {formatSeconds(remainingSeconds)}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {timerAction}
        {isRecommendedRestComplete ? (
          <Button type="button" size="sm" onClick={() => onFinish(timer.elapsedSeconds)}>
            <Play className="mr-2 size-4" />
            {t("rest.nextSet")}
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onFinish(timer.elapsedSeconds)}
        >
          {t("rest.skip")}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => dispatch(resetRestTimer())}>
          <TimerReset className="mr-2 size-4" />
          {t("rest.reset")}
        </Button>
      </div>
    </section>
  );
}
