import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkoutDetail } from "../../types/workout-builder.types";

interface WorkoutHeaderProps {
  workout: WorkoutDetail | null;
  isEditingWorkoutName: boolean;
  workoutNameInput: string;
  setWorkoutNameInput: (value: string) => void;
  setIsEditingWorkoutName: (value: boolean) => void;
  handleSaveWorkoutName: () => void;
  setIsModalOpen: (value: boolean) => void;
}

export function WorkoutHeader({
  workout,
  isEditingWorkoutName,
  workoutNameInput,
  setWorkoutNameInput,
  setIsEditingWorkoutName,
  handleSaveWorkoutName,
  setIsModalOpen,
}: WorkoutHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div className="space-y-1">
        {isEditingWorkoutName ? (
          <div className="flex items-center gap-2">
            <Input 
              value={workoutNameInput} 
              onChange={(e) => setWorkoutNameInput(e.target.value)} 
              className="h-8 text-base font-bold w-64"
              autoFocus
            />
            <Button size="sm" onClick={handleSaveWorkoutName}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditingWorkoutName(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingWorkoutName(true)}>
            <h3 className="text-xl font-bold tracking-tight">{workout?.name || "Workout Session"}</h3>
            <span className="text-xs text-muted-foreground underline opacity-0 group-hover:opacity-100 transition-opacity">Edit Name</span>
          </div>
        )}
        <p className="text-sm text-muted-foreground">Configure sets, reps, and exercises for this session.</p>
      </div>
      <Button size="sm" onClick={() => setIsModalOpen(true)}>
        + Add Exercise
      </Button>
    </div>
  );
}