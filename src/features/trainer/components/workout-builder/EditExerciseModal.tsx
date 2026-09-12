import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssignedExercise } from "../../types/workout-builder.types";

interface EditExerciseModalProps {
  editingExercise: AssignedExercise | null;
  onClose: () => void;
  setsCount: number | string;
  setSetsCount: (val: number | string) => void;
  repsCount: number | string;
  setRepsCount: (val: number | string) => void;
  restTime: number | string;
  setRestTime: (val: number | string) => void;
  handleSaveReps: () => void;
}

export function EditExerciseModal({
  editingExercise,
  onClose,
  setsCount,
  setSetsCount,
  repsCount,
  setRepsCount,
  restTime,
  setRestTime,
  handleSaveReps,
}: EditExerciseModalProps) {
  if (!editingExercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-semibold">Edit Sets & Reps</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Sets</label>
            <Input 
              type="number" 
              value={setsCount} 
              onChange={(e) => setSetsCount(e.target.value === "" ? "" : Number(e.target.value))} 
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Reps</label>
            <Input 
              type="number" 
              value={repsCount} 
              onChange={(e) => setRepsCount(e.target.value === "" ? "" : Number(e.target.value))} 
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Rest (seconds)</label>
            <Input 
              type="number" 
              value={restTime} 
              onChange={(e) => setRestTime(e.target.value === "" ? "" : Number(e.target.value))} 
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveReps}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}