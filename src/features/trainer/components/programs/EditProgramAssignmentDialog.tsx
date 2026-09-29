"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Dumbbell, Loader2, Save, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { programService } from "../../services/program.service";
import type { ProgramHistoryRow } from "./ProgramHistoryTable";

interface AssignedExercise {
  workoutExerciseTemplateId: number;
  exerciseName: string;
  reps: string;
  sets: number;
  weight: number;
  restSeconds: number;
}

interface AssignedWorkout {
  id: number;
  name: string;
  exercises: AssignedExercise[];
}

interface EditableExercise {
  workoutId: number;
  workoutName: string;
  workoutExerciseTemplateId: number;
  exerciseName: string;

  originalReps: string;
  reps: string;

  originalSets: number;
  sets: string;

  originalWeight: number;
  weight: string;

  originalRestSeconds: number;
  restSeconds: string;
}

interface WeekWorkout {
  id: number;
  name: string;
}

interface WeekDetail {
  id: number;
  name: string;
  workouts?: WeekWorkout[];
  workoutTemplates?: WeekWorkout[];
}

interface EditProgramAssignmentDialogProps {
  row: ProgramHistoryRow | null;
  open: boolean;
  onClose: () => void;
}

export default function EditProgramAssignmentDialog({
  row,
  open,
  onClose,
}: EditProgramAssignmentDialogProps) {
  const [editableExercises, setEditableExercises] = useState<EditableExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !row) return;

    let cancelled = false;

    const loadAssignment = async () => {
      setIsLoading(true);
      setError(null);
      setEditableExercises([]);

      try {
        const templateResponse = await programService.getTemplateDetail(row.templateId);
        const template = templateResponse.data?.data;

        const weeks: Array<{ id: number; name: string }> = template?.weeks ?? [];

        const weekDetails = await Promise.all(
          weeks.map(async (week) => {
            const response = await programService.getWeekDetail(week.id);
            return response.data?.data as WeekDetail | undefined;
          })
        );

        if (cancelled) return;

        const workouts: WeekWorkout[] = weekDetails.flatMap(
          (week) => week?.workouts ?? week?.workoutTemplates ?? []
        );

        const uniqueWorkouts = Array.from(
          new Map(workouts.map((workout) => [workout.id, workout])).values()
        );

        const assignedWorkouts = await Promise.all(
          uniqueWorkouts.map(async (workout): Promise<AssignedWorkout> => {
            const response = await programService.getAssignedWorkoutDetail(
              row.id,
              workout.id
            );
            const data = response.data?.data;

            const exercises: AssignedExercise[] = (
              data?.exercisesTemplates ?? []
            ).map((exercise: any) => ({
              workoutExerciseTemplateId: Number(exercise.id),
              exerciseName: exercise.exercise?.name ?? "Exercise",
              reps: String(exercise.reps ?? ""),
              sets: Number(exercise.sets ?? 0),
              weight: Number(exercise.weight ?? 0),
              restSeconds: Number(exercise.restSeconds ?? 0),
            }));

            return {
              id: workout.id,
              name: data?.name ?? workout.name,
              exercises,
            };
          })
        );

        if (cancelled) return;

        const exercises: EditableExercise[] = assignedWorkouts.flatMap((workout) =>
          workout.exercises.map((exercise) => ({
            workoutId: workout.id,
            workoutName: workout.name,
            workoutExerciseTemplateId: exercise.workoutExerciseTemplateId,
            exerciseName: exercise.exerciseName,
            originalReps: exercise.reps,
            reps: exercise.reps,
            originalSets: exercise.sets,
            sets: String(exercise.sets),
            originalWeight: exercise.weight,
            weight: String(exercise.weight),
            originalRestSeconds: exercise.restSeconds,
            restSeconds: String(exercise.restSeconds),
          }))
        );

        setEditableExercises(exercises);
      } catch (err) {
        console.error("Failed to load assignment exercises:", err);
        if (!cancelled) {
          setError("Failed to load the assigned program exercises.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadAssignment();

    return () => {
      cancelled = true;
    };
  }, [open, row]);

  const updateExercise = (
    workoutExerciseTemplateId: number,
    changes: Partial<EditableExercise>
  ) => {
    setEditableExercises((current) =>
      current.map((exercise) =>
        exercise.workoutExerciseTemplateId === workoutExerciseTemplateId
          ? { ...exercise, ...changes }
          : exercise
      )
    );
  };

  const handleSave = async () => {
    if (!row) return;

    setIsSaving(true);
    setError(null);

    try {
      const changedExercises = editableExercises.filter(
        (exercise) =>
          exercise.reps !== exercise.originalReps ||
          Number(exercise.sets) !== exercise.originalSets ||
          Number(exercise.weight) !== exercise.originalWeight ||
          Number(exercise.restSeconds) !== exercise.originalRestSeconds
      );

      if (changedExercises.length === 0) {
        onClose();
        return;
      }

      const overrides = changedExercises.map((exercise) => ({
        workoutExerciseTemplateId: exercise.workoutExerciseTemplateId,
        reps: exercise.reps,
        sets: Number(exercise.sets),
        weight: Number(exercise.weight),
        restSeconds: Number(exercise.restSeconds),
      }));

      await programService.overridePlanExercises(row.id, overrides);
      onClose();
    } catch (err) {
      console.error("Failed to update assignment exercise configuration:", err);
      setError("Failed to update the program exercise configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  const workoutGroups = Array.from(
    new Map(
      editableExercises.map((ex) => [ex.workoutId, ex.workoutName])
    ).entries()
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isSaving && onClose()}>
      <DialogContent className="max-h-[90vh] sm:max-w-[850px] flex flex-col p-3 overflow-hidden text-start">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border/60">
          <DialogTitle className="font-heading text-xl font-bold uppercase tracking-wider text-foreground">
            Edit Program Exercises
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update exercise settings for this trainee&apos;s assignment. These changes will not modify the original program.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Trainee & Program Summary Header */}
          {row && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <User className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trainee</p>
                  <p className="text-sm font-bold text-foreground">{row.traineeName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Dumbbell className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Program Plan</p>
                  <p className="text-sm font-bold text-foreground">{row.templateName}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Loading exercises...</span>
            </div>
          ) : editableExercises.length === 0 && !error ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No exercises found in this program.
            </div>
          ) : (
            workoutGroups.map(([workoutId, workoutName]) => {
              const workoutExercises = editableExercises.filter(
                (ex) => ex.workoutId === workoutId
              );

              return (
                <div key={workoutId} className="space-y-3">
                  {/* Workout Title */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">
                      {workoutName}
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {workoutExercises.length} {workoutExercises.length === 1 ? "Exercise" : "Exercises"}
                    </Badge>
                  </div>

                  {/* Exercise Rows Grid */}
                  <div className="space-y-2.5">
                    {workoutExercises.map((exercise) => (
                      <div
                        key={exercise.workoutExerciseTemplateId}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end rounded-xl border border-border/80 bg-card p-4 shadow-2xs hover:border-primary/40 transition-colors"
                      >
                        {/* Exercise Name */}
                        <div className="sm:col-span-4 flex flex-col justify-center pb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            Exercise Name
                          </span>
                          <p className="text-sm font-bold text-foreground leading-snug">
                            {exercise.exerciseName}
                          </p>
                        </div>

                        {/* Reps Field */}
                        <div className="sm:col-span-2 flex flex-col space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                            Reps
                          </label>
                          <Input
                            type="text"
                            value={exercise.reps}
                            onChange={(e) =>
                              updateExercise(exercise.workoutExerciseTemplateId, { reps: e.target.value })
                            }
                            className="h-9 text-center font-mono font-semibold focus-visible:ring-1"
                          />
                        </div>

                        {/* Sets Field */}
                        <div className="sm:col-span-2 flex flex-col space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                            Sets
                          </label>
                          <Input
                            type="number"
                            min={1}
                            value={exercise.sets}
                            onChange={(e) =>
                              updateExercise(exercise.workoutExerciseTemplateId, { sets: e.target.value })
                            }
                            className="h-9 text-center font-mono font-semibold focus-visible:ring-1"
                          />
                        </div>

                        {/* Weight Field */}
                        <div className="sm:col-span-2 flex flex-col space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                            Weight (kg)
                          </label>
                          <Input
                            type="number"
                            min={0}
                            step={0.5}
                            value={exercise.weight}
                            onChange={(e) =>
                              updateExercise(exercise.workoutExerciseTemplateId, { weight: e.target.value })
                            }
                            className="h-9 text-center font-mono font-semibold focus-visible:ring-1"
                          />
                        </div>

                        {/* Rest Field */}
                        <div className="sm:col-span-2 flex flex-col space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                            Rest (sec)
                          </label>
                          <Input
                            type="number"
                            min={0}
                            step={5}
                            value={exercise.restSeconds}
                            onChange={(e) =>
                              updateExercise(exercise.workoutExerciseTemplateId, { restSeconds: e.target.value })
                            }
                            className="h-9 text-center font-mono font-semibold focus-visible:ring-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="border-t border-border/60 bg-muted/20 p-4 sm:flex sm:items-center sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onClose}
            className="font-semibold text-xs uppercase tracking-wider"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSaving || isLoading}
            onClick={handleSave}
            className="gap-2 font-semibold text-xs uppercase tracking-wider min-w-28"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}