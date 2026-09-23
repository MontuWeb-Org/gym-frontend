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
if (selectedTrainees.length === 0) {
return null;
}

return ( <div className="space-y-3"> <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
Selected Trainees ({selectedTrainees.length}) </label>


  <div className="space-y-2 p-3 rounded-lg border bg-muted/20 max-h-60 overflow-y-auto">
    {selectedTrainees.map((trainee) => (
      <div
        key={trainee.id}
        className="flex items-center justify-between gap-3 bg-card p-3 rounded-md border shadow-sm text-xs"
      >
        <div className="flex items-center gap-2 font-medium">
          <span className="text-primary font-semibold">
            {trainee.name}
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            onRemove(trainee.id)
          }
          className="text-muted-foreground hover:text-destructive transition-colors font-bold"
          title="Remove"
          aria-label={`Remove ${trainee.name}`}
        >
          ✕
        </button>
      </div>
    ))}
  </div>
</div>


);
}
