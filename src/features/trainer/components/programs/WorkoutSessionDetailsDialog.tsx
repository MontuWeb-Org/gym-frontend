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
  formatDateTime: (date: string) => string;
  getWorkoutDuration: (
    startedAt: string,
    endedAt: string
  ) => string;
}

export default function WorkoutSessionDetailsDialog({
  open,
  selectedWorkoutLog,
  isLoadingLogDetail,
  logDetailError,
  onClose,
  formatDateTime,
  getWorkoutDuration,
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
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Workout Session Details
          </DialogTitle>

          <DialogDescription>
            Detailed information about this workout
            session.
          </DialogDescription>
        </DialogHeader>

        {isLoadingLogDetail && (
          <p className="text-sm text-muted-foreground">
            Loading workout details...
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
              {/* Workout summary */}
              <div className="rounded-lg border p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Completed on
                    </p>

                    <p className="text-sm font-medium">
                      {formatDateTime(
                        selectedWorkoutLog.startedAt
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Status
                    </p>

                    <p className="text-sm font-medium">
                      {selectedWorkoutLog.status}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Duration
                    </p>

                    <p className="text-sm font-medium">
                      {getWorkoutDuration(
                        selectedWorkoutLog.startedAt,
                        selectedWorkoutLog.endedAt
                      )}
                    </p>
                  </div>
                </div>

                {selectedWorkoutLog.notes && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">
                      Notes
                    </p>

                    <p className="mt-1 text-sm">
                      {selectedWorkoutLog.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Exercises */}
              <div>
                <h3 className="mb-4 text-base font-semibold">
                  Exercises
                </h3>

                {selectedWorkoutLog.exerciseLogs
                  .length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No exercise logs found for this
                    workout.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {selectedWorkoutLog.exerciseLogs.map(
                      (exercise) => (
                        <div
                          key={exercise.id}
                          className="rounded-lg border p-4"
                        >
                          <div className="mb-4 flex items-center justify-between gap-4">
                            <p className="font-medium">
                              {exercise.exerciseName}
                            </p>

                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                Duration
                              </p>

                              <p className="text-sm font-medium">
                                {
                                  exercise.durationMinutes
                                }{" "}
                                min
                              </p>
                            </div>
                          </div>

                          <div className="overflow-hidden rounded-md border">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="px-4 py-2 text-left font-medium">
                                    Set
                                  </th>

                                  <th className="px-4 py-2 text-left font-medium">
                                    Reps
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {exercise.sets.map(
                                  (set) => (
                                    <tr
                                      key={`${exercise.id}-${set.setNumber}`}
                                      className="border-t"
                                    >
                                      <td className="px-4 py-2">
                                        {
                                          set.setNumber
                                        }
                                      </td>

                                      <td className="px-4 py-2">
                                        {set.reps}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    )}
                  </div>
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