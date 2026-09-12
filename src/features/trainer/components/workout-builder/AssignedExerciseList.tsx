import React from "react";
import { Button } from "@/components/ui/button";
import { AssignedExercise } from "../../types/workout-builder.types";

interface AssignedExerciseListProps {
  exercises: AssignedExercise[];
  setIsModalOpen: (value: boolean) => void;
  handleMoveExercise: (index: number, direction: 'up' | 'down') => void;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, dropIndex: number) => void;
  handleRemoveExercise: (exerciseId: number) => void;
  onEditExercise: (exercise: AssignedExercise, setsLen: number, repsVal: number, restVal: number) => void;
}

export function AssignedExerciseList({
  exercises,
  setIsModalOpen,
  handleMoveExercise,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleRemoveExercise,
  onEditExercise,
}: AssignedExerciseListProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Assigned Exercises</h4>
      
      {exercises.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">No exercises added to this workout session yet.</p>
          <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(true)}>
            + Add Exercise
          </Button>
        </div>
      ) : (
        exercises.map((exercise, index) => {
          const setsLen = Array.isArray(exercise.sets) ? exercise.sets.length : 3;
          const repsVal = Array.isArray(exercise.sets) && exercise.sets[0]?.reps ? exercise.sets[0].reps : 10;
          const restVal = exercise.rest || 60;

          return (
            <div 
              key={exercise.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e)}
              onDrop={(e) => handleDrop(e, index)}
              className="flex items-center justify-between p-4 rounded-lg border bg-background shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-0.5">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    disabled={index === 0}
                    onClick={() => handleMoveExercise(index, 'up')}
                  >
                    ▲
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    disabled={index === exercises.length - 1}
                    onClick={() => handleMoveExercise(index, 'down')}
                  >
                    ▼
                  </Button>
                </div>
                <div>
                  <h5 className="font-semibold text-base">{exercise.name}</h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sets: {setsLen} | Reps: {repsVal} | Rest: {restVal}s
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEditExercise(exercise, setsLen, repsVal, restVal)}
                >
                  Edit Reps
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleRemoveExercise(exercise.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}