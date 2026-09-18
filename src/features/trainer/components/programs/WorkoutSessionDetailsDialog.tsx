import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import type { WorkoutLogDetail } from "../../types/workoutLog.types";

interface WorkoutSessionDetailsDialogProps {
  open: boolean;
  selectedWorkoutLog: WorkoutLogDetail | null;
  isLoadingLogDetail: boolean;
  logDetailError: string | null;
  onClose: () => void;
}

export default function WorkoutSessionDetailsDialog({
  open,
  selectedWorkoutLog,
  isLoadingLogDetail,
  logDetailError,
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
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Workout Session Details
          </DialogTitle>

          <DialogDescription>
            Details of the selected workout session.
          </DialogDescription>
        </DialogHeader>

        {isLoadingLogDetail && (
          <p className="text-sm text-muted-foreground">
            Loading workout session details...
          </p>
        )}

        {logDetailError && (
          <p className="text-sm text-destructive">
            {logDetailError}
          </p>
        )}

        {!isLoadingLogDetail &&
          !logDetailError &&
          selectedWorkoutLog && (
            <div className="space-y-6">
              {/* Session Summary */}
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_2fr]">
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
                    {selectedWorkoutLog.durationMinutes}{" "}
                    min
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">
                    Session ID
                  </p>

                  <p className="mt-1 break-all text-sm text-muted-foreground">
                    {selectedWorkoutLog.id}
                  </p>
                </div>

                {selectedWorkoutLog.notes && (
                  <div className="rounded-lg border p-4 sm:col-span-3">
                    <p className="text-sm font-medium">
                      Notes
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedWorkoutLog.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Exercises */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Exercises
                </h3>

                {selectedWorkoutLog.exerciseLogs
                  .length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No exercise logs found.
                  </p>
                ) : (
                  selectedWorkoutLog.exerciseLogs.map(
                    (exercise) => (
                      <div
                        key={exercise.id}
                        className="rounded-lg border p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="font-medium">
                              {exercise.exerciseName}
                            </h4>

                            <p className="text-sm text-muted-foreground">
                              Expected:{" "}
                              {exercise.expectedSets}{" "}
                              sets ×{" "}
                              {exercise.expectedReps}{" "}
                              reps
                              {exercise.expectedWeight >
                                0 &&
                                ` × ${exercise.expectedWeight} kg`}
                            </p>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Duration:{" "}
                            {Math.round(
                              exercise.durationSeconds /
                                60
                            )}{" "}
                            min
                          </p>
                        </div>

                        {/* Set Logs */}
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
                                  Rest
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {exercise.setLogs.map(
                                (setLog) => (
                                  <tr
                                    key={setLog.id}
                                    className="border-b last:border-0"
                                  >
                                    <td className="px-3 py-2">
                                      {
                                        setLog.sequenceNumber
                                      }
                                    </td>

                                    <td className="px-3 py-2">
                                      {setLog.reps}
                                    </td>

                                    <td className="px-3 py-2">
                                      {setLog.weight} kg
                                    </td>

                                    <td className="px-3 py-2">
                                      {
                                        setLog.restTimeSeconds
                                      }{" "}
                                      sec
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}