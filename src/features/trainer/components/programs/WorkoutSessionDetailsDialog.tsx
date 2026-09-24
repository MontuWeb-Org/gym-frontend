"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { WorkoutLogDetail } from "../../types/workoutLog.types";

interface WorkoutSessionDetailsDialogProps {
  open: boolean;
  selectedWorkoutLog: WorkoutLogDetail | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export default function WorkoutSessionDetailsDialog({
  open,
  selectedWorkoutLog,
  isLoading,
  error,
  onClose,
}: WorkoutSessionDetailsDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {selectedWorkoutLog?.workoutTemplateName ??
              "Workout Session"}
          </DialogTitle>

          <DialogDescription>
            Workout session details
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex min-h-[220px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Loading workout session...
            </p>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </div>
        )}

        {!isLoading &&
          !error &&
          selectedWorkoutLog && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">
                    Status
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedWorkoutLog.status}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">
                    Duration
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {Math.round(
                      selectedWorkoutLog.durationMinutes
                    )}{" "}
                    min
                  </p>
                </div>

                {selectedWorkoutLog.notes && (
                  <div className="min-h-[100px] rounded-lg border p-4 sm:col-span-2">
                    <p className="text-sm font-medium">
                      Notes
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {selectedWorkoutLog.notes}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-3">
                  <h3 className="text-base font-semibold">
                    Exercises
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Exercise performance for this workout
                    session.
                  </p>
                </div>

                {selectedWorkoutLog.exerciseLogs.length ===
                0 ? (
                  <div className="rounded-lg border p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No exercise logs recorded for this
                      session.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedWorkoutLog.exerciseLogs.map(
                      (exercise) => (
                        <div
                          key={exercise.id}
                          className="rounded-lg border p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="font-medium">
                                {exercise.exerciseName}
                              </p>

                              <p className="text-sm text-muted-foreground">
                                {exercise.expectedReps} reps

                                {exercise.expectedWeight >
                                  0 && (
                                  <>
                                    {" × "}
                                    {exercise.expectedWeight}{" "}
                                    kg
                                  </>
                                )}
                              </p>
                            </div>

                            <p className="shrink-0 text-sm text-muted-foreground">
                              {exercise.setLogs.length}{" "}
                              {exercise.setLogs.length === 1
                                ? "set"
                                : "sets"}
                            </p>
                          </div>

                          {exercise.setLogs.length > 0 && (
                            <div className="mt-4 overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b text-left">
                                    <th className="px-3 py-2 font-medium">
                                      Set
                                    </th>

                                    <th className="px-3 py-2 font-medium">
                                      Reps
                                    </th>

                                    <th className="px-3 py-2 font-medium">
                                      Weight
                                    </th>

                                    <th className="px-3 py-2 font-medium">
                                      Duration
                                    </th>

                                    <th className="px-3 py-2 font-medium">
                                      Rest
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {exercise.setLogs.map(
                                    (set) => (
                                      <tr
                                        key={set.id}
                                        className="border-b last:border-0"
                                      >
                                        <td className="px-3 py-2">
                                          {set.sequenceNumber}
                                        </td>

                                        <td className="px-3 py-2">
                                          {set.reps}
                                        </td>

                                        <td className="px-3 py-2">
                                          {set.weight} kg
                                        </td>

                                        <td className="px-3 py-2">
                                          {set.durationSeconds}{" "}
                                          sec
                                        </td>

                                        <td className="px-3 py-2">
                                          {set.restTimeSeconds}{" "}
                                          sec
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}

