"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { ProgramHistoryRow } from "./ProgramHistoryTable";
import type { WorkoutLog } from "../../types/workoutLog.types";

interface WorkoutHistoryDialogProps {
  open: boolean;
  selectedProgram: ProgramHistoryRow | null;
  workoutLogs: WorkoutLog[];
  workoutNames: Record<number, string>;
  isLoadingLogs: boolean;
  logsError: string | null;
  onClose: () => void;
  onWorkoutLogClick: (log: WorkoutLog) => void;
}

export default function WorkoutHistoryDialog({
  open,
  selectedProgram,
  workoutLogs,
  workoutNames,
  isLoadingLogs,
  logsError,
  onClose,
  onWorkoutLogClick,
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
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

        <div className="space-y-4">
          {isLoadingLogs && (
            <div className="flex min-h-[180px] items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Loading workout history...
              </p>
            </div>
          )}

          {!isLoadingLogs && logsError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">
                {logsError}
              </p>
            </div>
          )}

          {!isLoadingLogs &&
            !logsError &&
            workoutLogs.length === 0 && (
              <div className="flex min-h-[180px] items-center justify-center rounded-lg border">
                <p className="text-sm text-muted-foreground">
                  No workout history found for this
                  program.
                </p>
              </div>
            )}

          {!isLoadingLogs &&
            !logsError &&
            workoutLogs.length > 0 && (
              <div className="space-y-3">
                {workoutLogs.map((log) => (
                  <button
                    key={log.workoutLogId}
                    type="button"
                    className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
                    onClick={() =>
                      onWorkoutLogClick(log)
                    }
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium">
                          {log.workoutTemplateName ??
                            workoutNames[
                              log.workoutTemplateId
                            ] ??
                            `Workout ${log.workoutTemplateId}`}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-medium">
                          {Math.round(
                            log.durationMinutes
                          )}{" "}
                          min
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
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}