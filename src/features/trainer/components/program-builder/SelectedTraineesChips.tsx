import React from "react";
import { Trainee } from "../../types/trainer.types";
import { TraineeAssignmentConfig } from "./PublishAssignModal";

interface SelectedTraineesChipsProps {
  selectedTrainees: Trainee[];
  assignments: Record<number, TraineeAssignmentConfig>;
  onUpdateConfig: (id: number, config: Partial<TraineeAssignmentConfig>) => void;
  onRemove: (id: number) => void;
}

export function SelectedTraineesChips({
  selectedTrainees,
  assignments,
  onUpdateConfig,
  onRemove,
}: SelectedTraineesChipsProps) {
  if (selectedTrainees.length === 0) return null;

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Selected Recipients & Timelines ({selectedTrainees.length})
      </label>
      <div className="space-y-2 p-3 rounded-lg border bg-muted/20 max-h-60 overflow-y-auto">
        {selectedTrainees.map(trainee => {
          const config = assignments[trainee.id] || { startDate: "", durationWeeks: 4 };
          return (
            <div 
              key={trainee.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-3 rounded-md border shadow-sm text-xs"
            >
              <div className="flex items-center gap-2 font-medium">
                <span className="text-primary font-semibold">{trainee.name}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground">Start Date</span>
                  <input 
                    type="date"
                    value={config.startDate}
                    onChange={(e) => onUpdateConfig(trainee.id, { startDate: e.target.value })}
                    className="rounded border px-2 py-1 text-xs bg-background"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground">Duration (Weeks)</span>
                  <input 
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={config.durationWeeks}
                    onChange={(e) => {
                      // Allows completely wiping the box, backspacing, and typing freely
                      const val = e.target.value;
                      // Only allow digits or empty string
                      if (val === "" || /^\d+$/.test(val)) {
                        onUpdateConfig(trainee.id, { durationWeeks: val });
                      }
                    }}
                    className="rounded border px-2 py-1 text-xs w-20 bg-background text-center"
                  />
                </div>

                <button 
                  type="button"
                  onClick={() => onRemove(trainee.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors font-bold ml-2 self-end sm:self-center"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}