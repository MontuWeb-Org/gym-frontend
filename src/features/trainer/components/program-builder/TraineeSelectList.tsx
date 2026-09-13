import React from "react";
import { Trainee } from "../../types/trainer.types";

interface TraineeSelectListProps {
  trainees: Trainee[];
  selectedIds: number[];
  loading: boolean;
  onToggle: (id: number) => void;
}

export function TraineeSelectList({
  trainees,
  selectedIds,
  loading,
  onToggle,
}: TraineeSelectListProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Select Trainees
      </label>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground py-6">Loading roster...</p>
        ) : trainees.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">No trainees found.</p>
        ) : (
          trainees.map(trainee => {
            const isSelected = selectedIds.includes(trainee.id);
            return (
              <div
                key={trainee.id}
                onClick={() => onToggle(trainee.id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected ? "border-primary bg-primary/10" : "hover:bg-muted/50"
                }`}
              >
                <div>
                  <h5 className="font-medium text-sm">{trainee.name}</h5>
                  <p className="text-xs text-muted-foreground">{trainee.programName || "No active program"}</p>
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}