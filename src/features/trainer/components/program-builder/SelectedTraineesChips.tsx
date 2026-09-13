import React from "react";
import { Trainee } from "../../types/trainer.types";

interface SelectedTraineesChipsProps {
  selectedTrainees: Trainee[];
  onRemove: (id: number) => void;
}

export function SelectedTraineesChips({
  selectedTrainees,
  onRemove,
}: SelectedTraineesChipsProps) {
  if (selectedTrainees.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Selected Recipients ({selectedTrainees.length})
      </label>
      <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/20">
        {selectedTrainees.map(trainee => (
          <div 
            key={trainee.id}
            className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium"
          >
            <span>{trainee.name}</span>
            <button 
              type="button"
              onClick={() => onRemove(trainee.id)}
              className="hover:text-destructive transition-colors font-bold ml-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}