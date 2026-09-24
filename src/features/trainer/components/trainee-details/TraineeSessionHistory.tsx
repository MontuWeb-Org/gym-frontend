"use client";

import { useEffect, useState } from "react";

import { programService } from "../../services/program.service";

import WorkoutSessionDetailsDialog from "../programs/WorkoutSessionDetailsDialog";

import type {
  WorkoutLog,
  WorkoutLogDetail,
} from "../../types/workoutLog.types";

interface TraineeSessionHistoryProps {
  traineeId: number;
}

export default function TraineeSessionHistory({
  traineeId,
}: TraineeSessionHistoryProps) {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedWorkoutLog, setSelectedWorkoutLog] =
    useState<WorkoutLogDetail | null>(null);

  const [isLoadingLogDetail, setIsLoadingLogDetail] = useState(false);
  const [logDetailError, setLogDetailError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadWorkoutHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await programService.getWorkoutLogs(traineeId);

        if (!isMounted) {
          return;
        }

        const logs: WorkoutLog[] = response.data?.data ?? [];

        setWorkoutLogs(logs);
      } catch (err) {
        console.error("Failed to fetch trainee workout history:", err);

        if (isMounted) {
          setError("Failed to load workout history.");
          setWorkoutLogs([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadWorkoutHistory();

    return () => {
      isMounted = false;
    };
  }, [traineeId]);

  const handleWorkoutLogClick = async (log: WorkoutLog) => {
    setSelectedWorkoutLog(null);
    setLogDetailError(null);
    setIsLoadingLogDetail(true);

    try {
      const response = await programService.getWorkoutLogDetail(
        log.workoutLogId,
      );

      const detail: WorkoutLogDetail = response.data?.data;

      setSelectedWorkoutLog(detail);
    } catch (err) {
      console.error("Failed to fetch workout log details:", err);

      setLogDetailError(
        "Failed to load workout session details.",
      );
    } finally {
      setIsLoadingLogDetail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-border bg-card">
        <p className="text-sm text-muted-foreground">
          Loading workout history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (workoutLogs.length === 0) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-border bg-card">
        <p className="text-sm text-muted-foreground">
          No workout history found for this trainee.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">
            Workout History
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Recorded workout sessions for this trainee.
          </p>
        </div>

        <div className="space-y-3">
          {workoutLogs.map((log) => (
            <button
              key={log.workoutLogId}
              type="button"
              className="w-full rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50"
              onClick={() => handleWorkoutLogClick(log)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {log.workoutTemplateName ??
                      `Workout ${log.workoutTemplateId}`}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-foreground">
                    {Math.round(log.durationMinutes)} min
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {log.status}
                  </p>
                </div>
              </div>

              {log.notes && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {log.notes}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      <WorkoutSessionDetailsDialog
        open={selectedWorkoutLog !== null}
        selectedWorkoutLog={selectedWorkoutLog}
        isLoading={isLoadingLogDetail}
        error={logDetailError}
        onClose={() => {
          setSelectedWorkoutLog(null);
          setLogDetailError(null);
        }}
      />
    </>
  );
}