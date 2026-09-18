import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import type { ProgramHistoryRow } from "./ProgramHistoryTable";
import type { WorkoutLog } from "../../types/workoutLog.types";

interface WorkoutHistoryDialogProps {
  open: boolean;
  selectedProgram: ProgramHistoryRow | null;
  workoutLogs: WorkoutLog[];
  isLoadingLogs: boolean;
  logsError: string | null;
  onClose: () => void;
  onWorkoutLogClick: (log: WorkoutLog) => void;
  formatDateTime: (date: string) => string;
  getWorkoutDuration: (
    startedAt: string,
    endedAt: string
  ) => string;
}

export default function WorkoutHistoryDialog({
  open,
  selectedProgram,
  workoutLogs,
  isLoadingLogs,
  logsError,
  onClose,
  onWorkoutLogClick,
  formatDateTime,
  getWorkoutDuration,
}: WorkoutHistoryDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Workout History
          </DialogTitle>

          <DialogDescription>
            {selectedProgram
              ? `${selectedProgram.traineeName} - ${selectedProgram.templateName}`
              : "Workout history"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {isLoadingLogs && (
            <p className="text-sm text-muted-foreground">
              Loading workout history...
            </p>
          )}

          {logsError && (
            <p className="text-sm text-destructive">
              {logsError}
            </p>
          )}

          {!isLoadingLogs &&
            !logsError &&
            workoutLogs.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No workout sessions found for this
                program.
              </p>
            )}

          {!isLoadingLogs &&
            !logsError &&
            workoutLogs.map((log, index) => (
              <button
                key={log.id}
                type="button"
                className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
                onClick={() =>
                  onWorkoutLogClick(log)
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      Workout Session{" "}
                      {workoutLogs.length - index}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(log.startedAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {getWorkoutDuration(
                        log.startedAt,
                        log.endedAt
                      )}
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