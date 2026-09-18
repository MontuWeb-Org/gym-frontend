"use client";

import { useEffect, useState } from "react";
import { programService } from "../services/program.service";
import {
  AssignedExercise,
  LibraryExercise,
  WorkoutDetail,
} from "../types/workout-builder.types";

export function useWorkoutBuilder(
  workoutId: number
) {
  const [workout, setWorkout] =
    useState<WorkoutDetail | null>(null);

  const [exercises, setExercises] =
    useState<AssignedExercise[]>([]);

  const [libraryExercises, setLibraryExercises] =
    useState<LibraryExercise[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [selectedExerciseIds, setSelectedExerciseIds] =
    useState<number[]>([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [editingExercise, setEditingExercise] =
    useState<AssignedExercise | null>(null);

  const [setsCount, setSetsCount] =
    useState<number | string>(3);

  const [repsCount, setRepsCount] =
    useState<number | string>(10);

  const [restTime, setRestTime] =
    useState<number | string>(60);

  const [weight, setWeight] =
    useState<number | string>(0);

  const [isEditingWorkoutName, setIsEditingWorkoutName] =
    useState(false);

  const [workoutNameInput, setWorkoutNameInput] =
    useState("");

  const [draggedIndex, setDraggedIndex] =
    useState<number | null>(null);

  /*
   * Safely convert a value to a number.
   * If the value is missing or invalid,
   * use the provided fallback.
   */
  const getNumber = (
    value: unknown,
    fallback: number
  ) => {
    const numberValue = Number(value);

    return Number.isFinite(numberValue)
      ? numberValue
      : fallback;
  };

  /*
   * Load workout details and exercise library.
   */
  useEffect(() => {
    async function loadWorkoutData() {
      if (!workoutId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [
          workoutRes,
          exercisesRes,
        ] = await Promise.all([
          programService.getWorkoutDetail(
            workoutId
          ),
          programService.getExercises(),
        ]);

        const fetchedWorkout =
          workoutRes.data.data;

        setWorkout(fetchedWorkout);

        setWorkoutNameInput(
          fetchedWorkout.name ||
            "Workout Session"
        );

        const fetchedLib =
          exercisesRes.data.data
            ?.exercises ||
          exercisesRes.data.data ||
          [];

        setLibraryExercises(
          fetchedLib
        );

        const rawExercises =
          fetchedWorkout.exercises ||
          [];

        const formattedExercises =
          rawExercises.map(
            (
              ex: AssignedExercise & {
                defaultSets?: number;
                defaultReps?: string | number;
                defaultRestTimeSeconds?: number;
                defaultWeight?: number;
              }
            ) => {
              const matchLib =
                fetchedLib.find(
                  (
                    l: LibraryExercise
                  ) =>
                    l.id ===
                    ex.exerciseId
                );

              /*
               * The template exercise can contain:
               *
               * - defaultSets
               * - defaultReps
               * - defaultRestTimeSeconds
               * - defaultWeight
               *
               * Prefer these values whenever they
               * exist because they represent the
               * current template configuration.
               */

              const hasDefaultSets =
                ex.defaultSets !==
                undefined;

              const hasDefaultReps =
                ex.defaultReps !==
                undefined;

              const hasDefaultRest =
                ex.defaultRestTimeSeconds !==
                undefined;

              const hasDefaultWeight =
                ex.defaultWeight !==
                undefined;

              const savedSets =
                Array.isArray(
                  ex.sets
                )
                  ? ex.sets
                  : [];

              /*
               * Sets
               *
               * Prefer defaultSets because this
               * is what the edit modal updates.
               */
              const savedSetsCount =
                hasDefaultSets
                  ? getNumber(
                      ex.defaultSets,
                      3
                    )
                  : savedSets.length ||
                    3;

              /*
               * Reps
               *
               * Prefer defaultReps when it exists.
               */
              const savedReps =
                hasDefaultReps
                  ? ex.defaultReps
                  : ex.reps ??
                    savedSets[0]
                      ?.reps ??
                    10;

              /*
               * Rest
               *
               * Prefer defaultRestTimeSeconds
               * when it exists.
               */
              const savedRest =
                hasDefaultRest
                  ? ex.defaultRestTimeSeconds
                  : ex.rest ??
                    60;

              /*
               * Weight
               *
               * Prefer defaultWeight when it
               * exists.
               */
              const savedWeight =
                hasDefaultWeight
                  ? ex.defaultWeight
                  : savedSets[0]
                      ?.weight ??
                    0;

              const sets =
                Array.from(
                  {
                    length:
                      Math.max(
                        1,
                        getNumber(
                          savedSetsCount,
                          3
                        )
                      ),
                  },
                  (_, index) => ({
                    setNumber:
                      index + 1,

                    reps:
                      getNumber(
                        savedReps,
                        10
                      ),

                    weight:
                      getNumber(
                        savedWeight,
                        0
                      ),
                  })
                );

              return {
                ...ex,

                name:
                  ex.name ||
                  matchLib?.name ||
                  "Exercise",

                sets,

                reps:
                  getNumber(
                    savedReps,
                    10
                  ),

                rest:
                  getNumber(
                    savedRest,
                    60
                  ),
              };
            }
          );

        setExercises(
          formattedExercises
        );
      } catch (err) {
        console.error(
          "Failed to load workout details",
          err
        );
      } finally {
        setLoading(false);
      }
    }

    loadWorkoutData();
  }, [workoutId]);

  /*
   * Select or unselect an exercise
   * from the exercise library.
   */
  const toggleSelectExercise = (
    id: number
  ) => {
    if (
      selectedExerciseIds.includes(id)
    ) {
      setSelectedExerciseIds(
        selectedExerciseIds.filter(
          (item) => item !== id
        )
      );
    } else {
      setSelectedExerciseIds([
        ...selectedExerciseIds,
        id,
      ]);
    }
  };

  /*
   * Add selected exercises to the workout.
   */
  const handleAddSelectedExercises =
    async () => {
      if (
        selectedExerciseIds.length ===
        0
      ) {
        return;
      }

      try {
        for (const exerciseId of selectedExerciseIds) {
          const exerciseDef =
            libraryExercises.find(
              (e) =>
                e.id === exerciseId
            );

          if (
            exercises.some(
              (ex) =>
                ex.exerciseId ===
                  exerciseId ||
                ex.id === exerciseId
            )
          ) {
            continue;
          }

          const res =
            await programService.addExerciseToWorkout(
              {
                workoutTemplateId:
                  workoutId,

                exerciseId:
                  exerciseId,

                sequenceNumber:
                  exercises.length + 1,

                defaultSets: 3,

                defaultReps:
                  "10",

                defaultRestTimeSeconds:
                  60,

                defaultDurationMinutes:
                  0,

                defaultWeight: 0,
              }
            );

          const newEx =
            res.data.data;

          setExercises((prev) => [
            ...prev,
            {
              id:
                newEx.id ||
                Date.now(),

              exerciseId:
                exerciseId,

              name:
                exerciseDef?.name ||
                "Custom Exercise",

              difficulty:
                exerciseDef?.difficulty ||
                "Intermediate",

              equipment:
                exerciseDef?.equipment ||
                ["Dumbbell"],

              sets: [
                {
                  setNumber: 1,
                  reps: 10,
                  weight: 0,
                },
                {
                  setNumber: 2,
                  reps: 10,
                  weight: 0,
                },
                {
                  setNumber: 3,
                  reps: 10,
                  weight: 0,
                },
              ],

              reps: 10,

              rest: 60,
            },
          ]);
        }

        setSelectedExerciseIds([]);
        setSearchQuery("");
        setIsModalOpen(false);
      } catch (err) {
        console.error(
          "Failed to add exercises",
          err
        );
      }
    };

  /*
   * Remove an exercise from the workout.
   */
  const handleRemoveExercise = async (
    exerciseId: number
  ) => {
    try {
      await programService.deleteWorkoutExercise(
        exerciseId
      );

      setExercises(
        (currentExercises) =>
          currentExercises.filter(
            (ex) =>
              ex.id !== exerciseId
          )
      );
    } catch (err) {
      console.error(
        "Failed to remove exercise",
        err
      );
    }
  };

  /*
   * Save the current exercise order.
   */
  const persistExerciseOrder =
    async (
      updatedExercises: AssignedExercise[]
    ) => {
      setExercises(
        updatedExercises
      );

      try {
        await programService.reorderExercises(
          workoutId,
          updatedExercises
        );
      } catch (err) {
        console.error(
          "Failed to save exercise reordering",
          err
        );
      }
    };

  /*
   * Move an exercise using the
   * up/down buttons.
   */
  const handleMoveExercise = (
    index: number,
    direction: "up" | "down"
  ) => {
    const newIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      newIndex < 0 ||
      newIndex >= exercises.length
    ) {
      return;
    }

    const updated = [
      ...exercises,
    ];

    const temp =
      updated[index];

    updated[index] =
      updated[newIndex];

    updated[newIndex] =
      temp;

    persistExerciseOrder(
      updated
    );
  };

  /*
   * Start dragging an exercise.
   */
  const handleDragStart = (
    e: React.DragEvent,
    index: number
  ) => {
    setDraggedIndex(index);

    e.dataTransfer.effectAllowed =
      "move";
  };

  /*
   * Allow an exercise to be dropped.
   */
  const handleDragOver = (
    e: React.DragEvent
  ) => {
    e.preventDefault();

    e.dataTransfer.dropEffect =
      "move";
  };

  /*
   * Handle dropping an exercise
   * into a new position.
   */
  const handleDrop = (
    e: React.DragEvent,
    dropIndex: number
  ) => {
    e.preventDefault();

    if (
      draggedIndex === null ||
      draggedIndex === dropIndex
    ) {
      return;
    }

    const updated = [
      ...exercises,
    ];

    const [
      movedItem,
    ] = updated.splice(
      draggedIndex,
      1
    );

    updated.splice(
      dropIndex,
      0,
      movedItem
    );

    persistExerciseOrder(
      updated
    );

    setDraggedIndex(null);
  };

  /*
   * Save the workout name.
   */
  const handleSaveWorkoutName =
    async () => {
      if (
        !workoutNameInput.trim() ||
        !workout
      ) {
        return;
      }

      try {
        const updatedName =
          workoutNameInput.trim();

        await programService.updateWorkout(
          workoutId,
          {
            name: updatedName,
          }
        );

        setWorkout({
          ...workout,
          name: updatedName,
        });

        window.dispatchEvent(
          new CustomEvent(
            "workoutNameUpdated",
            {
              detail: {
                workoutId,
                name: updatedName,
              },
            }
          )
        );

        setIsEditingWorkoutName(
          false
        );
      } catch (err) {
        console.error(
          "Failed to update workout name",
          err
        );
      }
    };

  /*
   * Open the edit modal for an exercise.
   */
  const handleEditExercise = (
    exercise: AssignedExercise,
    setsLen: number,
    repsVal: number,
    restVal: number
  ) => {
    setEditingExercise(
      exercise
    );

    setSetsCount(
      setsLen
    );

    setRepsCount(
      repsVal
    );

    setRestTime(
      restVal
    );

    const firstSet =
      Array.isArray(
        exercise.sets
      )
        ? exercise.sets[0]
        : undefined;

    setWeight(
      firstSet?.weight ?? 0
    );
  };

  /*
   * Save exercise parameters.
   */
  const handleSaveReps =
    async () => {
      if (!editingExercise) {
        return;
      }

      const finalSetsCount =
        setsCount === ""
          ? 3
          : Number(setsCount);

      const finalRepsCount =
        repsCount === ""
          ? 10
          : Number(repsCount);

      const finalRestTime =
        restTime === ""
          ? 60
          : Number(restTime);

      const finalWeight =
        weight === ""
          ? 0
          : Number(weight);

      try {
        await programService.updateWorkoutExercise(
          editingExercise.id,
          {
            defaultSets:
              finalSetsCount,

            defaultReps:
              String(
                finalRepsCount
              ),

            defaultRestTimeSeconds:
              finalRestTime,

            defaultWeight:
              finalWeight,
          }
        );

        /*
         * Update the local exercise immediately
         * so the UI reflects exactly what was saved.
         */
        setExercises(
          (currentExercises) =>
            currentExercises.map(
              (ex) => {
                if (
                  ex.id !==
                  editingExercise.id
                ) {
                  return ex;
                }

                return {
                  ...ex,

                  defaultSets:
                    finalSetsCount,

                  defaultReps:
                    String(
                      finalRepsCount
                    ),

                  defaultRestTimeSeconds:
                    finalRestTime,

                  defaultWeight:
                    finalWeight,

                  reps:
                    finalRepsCount,

                  sets:
                    Array.from(
                      {
                        length:
                          finalSetsCount,
                      },
                      (_, index) => ({
                        setNumber:
                          index + 1,

                        reps:
                          finalRepsCount,

                        weight:
                          finalWeight,
                      })
                    ),

                  rest:
                    finalRestTime,
                };
              }
            )
        );

        setEditingExercise(
          null
        );
      } catch (err) {
        console.error(
          "Failed to update exercise parameters",
          err
        );
      }
    };

  /*
   * Exercises already assigned to the workout.
   */
  const assignedExerciseIds =
    exercises.map(
      (ex) =>
        ex.exerciseId ||
        ex.id
    );

  /*
   * Filter the exercise library
   * using the search field.
   */
  const filteredLibrary =
    libraryExercises.filter(
      (libEx) =>
        libEx.name
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          )
    );

  return {
    workout,
    exercises,
    libraryExercises,
    loading,

    isModalOpen,
    setIsModalOpen,

    selectedExerciseIds,

    searchQuery,
    setSearchQuery,

    editingExercise,
    setEditingExercise,

    setsCount,
    setSetsCount,

    repsCount,
    setRepsCount,

    restTime,
    setRestTime,

    weight,
    setWeight,

    isEditingWorkoutName,
    workoutNameInput,
    setWorkoutNameInput,
    setIsEditingWorkoutName,

    assignedExerciseIds,
    filteredLibrary,

    toggleSelectExercise,
    handleAddSelectedExercises,
    handleRemoveExercise,

    handleMoveExercise,
    handleDragStart,
    handleDragOver,
    handleDrop,

    handleSaveWorkoutName,
    handleEditExercise,
    handleSaveReps,
  };
}