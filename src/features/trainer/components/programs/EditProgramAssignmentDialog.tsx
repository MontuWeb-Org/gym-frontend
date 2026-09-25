"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [editableExercises, setEditableExercises] = useState<
    EditableExercise[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !row) {
      return;
    }

    let cancelled = false;

    const loadAssignment = async () => {
      setIsLoading(true);
      setError(null);
      setEditableExercises([]);

      try {
        const templateResponse =
          await programService.getTemplateDetail(row.templateId);

        const template = templateResponse.data?.data;

        const weeks: Array<{
          id: number;
          name: string;
        }> = template?.weeks ?? [];

        const weekDetails = await Promise.all(
          weeks.map(async (week) => {
            const response = await programService.getWeekDetail(week.id);

            return response.data?.data as WeekDetail | undefined;
          }),
        );

        if (cancelled) {
          return;
        }

        const workouts: WeekWorkout[] = weekDetails.flatMap(
          (week) => week?.workouts ?? week?.workoutTemplates ?? [],
        );

        const uniqueWorkouts = Array.from(
          new Map(
            workouts.map((workout) => [workout.id, workout]),
          ).values(),
        );

        const assignedWorkouts = await Promise.all(
          uniqueWorkouts.map(
            async (workout): Promise<AssignedWorkout> => {
              const response =
                await programService.getAssignedWorkoutDetail(
                  row.id,
                  workout.id,
                );

              const data = response.data?.data;

              const exercises: AssignedExercise[] = (
                data?.exercisesTemplates ?? []
              ).map((exercise) => ({
                workoutExerciseTemplateId: Number(exercise.id),

                exerciseName:
                  exercise.exercise?.name ?? "Exercise",

                reps: String(exercise.reps ?? ""),

                sets: Number(exercise.sets ?? 0),

                weight: Number(exercise.weight ?? 0),

                restSeconds: Number(
                  exercise.restSeconds ?? 0,
                ),
              }));

              return {
                id: workout.id,
                name: data?.name ?? workout.name,
                exercises,
              };
            },
          ),
        );

        if (cancelled) {
          return;
        }

        const exercises: EditableExercise[] =
          assignedWorkouts.flatMap((workout) =>
            workout.exercises.map((exercise) => ({
              workoutId: workout.id,
              workoutName: workout.name,

              workoutExerciseTemplateId:
                exercise.workoutExerciseTemplateId,

              exerciseName: exercise.exerciseName,

              originalReps: exercise.reps,
              reps: exercise.reps,

              originalSets: exercise.sets,
              sets: String(exercise.sets),

              originalWeight: exercise.weight,
              weight: String(exercise.weight),

              originalRestSeconds:
                exercise.restSeconds,
              restSeconds: String(exercise.restSeconds),
            })),
          );

        setEditableExercises(exercises);
      } catch (error) {
        console.error(
          "Failed to load assignment exercises:",
          error,
        );

        if (!cancelled) {
          setError(
            "Failed to load the assigned program exercises.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAssignment();

    return () => {
      cancelled = true;
    };
  }, [open, row]);

  const updateExercise = (
    workoutExerciseTemplateId: number,
    changes: Partial<EditableExercise>,
  ) => {
    setEditableExercises((current) =>
      current.map((exercise) =>
        exercise.workoutExerciseTemplateId ===
        workoutExerciseTemplateId
          ? {
              ...exercise,
              ...changes,
            }
          : exercise,
      ),
    );
  };

  const handleNumberChange = (
    workoutExerciseTemplateId: number,
    field: "sets" | "weight" | "restSeconds",
    value: string,
  ) => {
    updateExercise(workoutExerciseTemplateId, {
      [field]: value,
    });
  };

  const handleSave = async () => {
    if (!row) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const changedExercises = editableExercises.filter(
        (exercise) =>
          exercise.reps !== exercise.originalReps ||
          Number(exercise.sets) !== exercise.originalSets ||
          Number(exercise.weight) !== exercise.originalWeight ||
          Number(exercise.restSeconds) !==
            exercise.originalRestSeconds,
      );

      if (changedExercises.length === 0) {
        onClose();
        return;
      }

      const overrides = changedExercises.map(
        (exercise) => ({
          workoutExerciseTemplateId:
            exercise.workoutExerciseTemplateId,

          reps: exercise.reps,

          sets: Number(exercise.sets),

          weight: Number(exercise.weight),

          restSeconds: Number(exercise.restSeconds),
        }),
      );

      await programService.overridePlanExercises(
        row.id,
        overrides,
      );

      onClose();
    } catch (error) {
      console.error(
        "Failed to update assignment exercise configuration:",
        error,
      );

      setError(
        "Failed to update the program exercise configuration.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDialogChange = (nextOpen: boolean) => {
    if (!nextOpen && !isSaving) {
      onClose();
    }
  };

  const workoutGroups = Array.from(
    new Map(
      editableExercises.map((exercise) => [
        exercise.workoutId,
        exercise.workoutName,
      ]),
    ).entries(),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={handleDialogChange}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>
            Edit Program Exercises
          </DialogTitle>

          <DialogDescription>
  Update exercise settings for this trainee&apos;s
  assignment. These changes will not modify the
  original program.
</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {row && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm">
                <span className="font-medium">
                  Trainee:
                </span>{" "}
                {row.traineeName}
              </p>

              <p className="mt-1 text-sm">
                <span className="font-medium">
                  Program:
                </span>{" "}
                {row.templateName}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex min-h-[160px] items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Loading assigned exercises...
              </p>
            </div>
          )}

          {!isLoading &&
            editableExercises.length === 0 &&
            !error && (
              <div className="rounded-lg border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No exercises found in this program.
                </p>
              </div>
            )}

          {!isLoading &&
            editableExercises.length > 0 && (
              <div className="space-y-6">
                {workoutGroups.map(
                  ([workoutId, workoutName]) => (
                    <div
                      key={workoutId}
                      className="space-y-3"
                    >
                      <h3 className="text-sm font-semibold">
                        {workoutName}
                      </h3>

                      <div className="overflow-hidden rounded-lg border">
                        {editableExercises
                          .filter(
                            (exercise) =>
                              exercise.workoutId ===
                              workoutId,
                          )
                          .map((exercise) => (
                            <div
                              key={
                                exercise.workoutExerciseTemplateId
                              }
                              className="border-b p-4 last:border-b-0"
                            >
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium">
                                    {exercise.exerciseName}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                  {/* REPS */}
                                  <div className="space-y-1">
                                    <label
                                      htmlFor={`reps-${exercise.workoutExerciseTemplateId}`}
                                      className="text-xs text-muted-foreground"
                                    >
                                      Reps
                                    </label>

                                    <Input
                                      id={`reps-${exercise.workoutExerciseTemplateId}`}
                                      value={exercise.reps}
                                      onChange={(event) =>
                                        updateExercise(
                                          exercise.workoutExerciseTemplateId,
                                          {
                                            reps: event.target
                                              .value,
                                          },
                                        )
                                      }
                                      className="w-full sm:w-[110px]"
                                      disabled={isSaving}
                                    />
                                  </div>

                                  {/* SETS */}
                                  <div className="space-y-1">
                                    <label
                                      htmlFor={`sets-${exercise.workoutExerciseTemplateId}`}
                                      className="text-xs text-muted-foreground"
                                    >
                                      Sets
                                    </label>

                                    <Input
                                      id={`sets-${exercise.workoutExerciseTemplateId}`}
                                      type="number"
                                      min={0}
                                      value={exercise.sets}
                                      onChange={(event) =>
                                        handleNumberChange(
                                          exercise.workoutExerciseTemplateId,
                                          "sets",
                                          event.target.value,
                                        )
                                      }
                                      className="w-full sm:w-[90px]"
                                      disabled={isSaving}
                                    />
                                  </div>

                                  {/* WEIGHT */}
                                  <div className="space-y-1">
                                    <label
                                      htmlFor={`weight-${exercise.workoutExerciseTemplateId}`}
                                      className="text-xs text-muted-foreground"
                                    >
                                      Weight (kg)
                                    </label>

                                    <Input
                                      id={`weight-${exercise.workoutExerciseTemplateId}`}
                                      type="number"
                                      min={0}
                                      step="0.5"
                                      value={exercise.weight}
                                      onChange={(event) =>
                                        handleNumberChange(
                                          exercise.workoutExerciseTemplateId,
                                          "weight",
                                          event.target.value,
                                        )
                                      }
                                      className="w-full sm:w-[110px]"
                                      disabled={isSaving}
                                    />
                                  </div>

                                  {/* REST */}
                                  <div className="space-y-1">
                                    <label
                                      htmlFor={`rest-${exercise.workoutExerciseTemplateId}`}
                                      className="text-xs text-muted-foreground"
                                    >
                                      Rest (sec)
                                    </label>

                                    <Input
                                      id={`rest-${exercise.workoutExerciseTemplateId}`}
                                      type="number"
                                      min={0}
                                      value={
                                        exercise.restSeconds
                                      }
                                      onChange={(event) =>
                                        handleNumberChange(
                                          exercise.workoutExerciseTemplateId,
                                          "restSeconds",
                                          event.target.value,
                                        )
                                      }
                                      className="w-full sm:w-[100px]"
                                      disabled={isSaving}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={
              isLoading ||
              isSaving ||
              editableExercises.length === 0
            }
            onClick={handleSave}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}