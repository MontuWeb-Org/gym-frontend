"use client";

import type { DragEvent } from "react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { programService } from "../services/program.service";
import {
  AssignedExercise,
  ExerciseTemplate,
  LibraryExercise,
  WorkoutDetail,
} from "../types/workout-builder.types";

interface ApiExerciseTemplate extends Omit<
  ExerciseTemplate,
  "exercise"
> {
  exercise?: LibraryExercise;
  // Compatibility with older MSW data while it is being migrated.
  exerciseId?: number;
  name?: string;
  difficulty?: string;
  equipment?: string[];
  instructions?: string;
  illustrations?: string[];
  muscles?: string[];
  defaultDurationMinutes?: number;
}

interface ApiWorkoutDetail extends Omit<
  WorkoutDetail,
  "exercises"
> {
  exercises?: ApiExerciseTemplate[];
}

export function useWorkoutBuilder(workoutId: number) {
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

  const [durationMinutes, setDurationMinutes] =
    useState<number | string>(0);

  const [isEditingWorkoutName, setIsEditingWorkoutName] =
    useState(false);

  const [workoutNameInput, setWorkoutNameInput] =
    useState("");

  const [draggedIndex, setDraggedIndex] =
    useState<number | null>(null);

  const getNumber = (
    value: unknown,
    fallback: number
  ) => {
    const numberValue = Number(value);

    return Number.isFinite(numberValue)
      ? numberValue
      : fallback;
  };

  /**
   * Convert the documented nested ExerciseTemplate API shape into
   * the flattened shape consumed by the existing UI.
   */
  const normalizeExercise = useCallback(
    (
      raw: ApiExerciseTemplate,
      library: LibraryExercise[]
    ): AssignedExercise => {
      const libraryExercise =
        raw.exercise ??
        library.find(
          (item) =>
            item.id ===
            Number(
              raw.exerciseId
            )
        );

      const exerciseId =
        Number(
          libraryExercise?.id ??
            raw.exerciseId
        );

      const setsCountValue =
        getNumber(
          raw.defaultSets,
          3
        );

      const repsValue =
        raw.defaultReps ??
        "10";

      const restValue =
        getNumber(
          raw.defaultRestTimeSeconds,
          60
        );

      const weightValue =
        getNumber(
          raw.defaultWeight,
          0
        );

      const durationValue =
        getNumber(
          raw.durationMinutes ??
            raw.defaultDurationMinutes,
          0
        );

      const sets = Array.from(
        {
          length: Math.max(
            1,
            setsCountValue
          ),
        },
        (_, index) => ({
          setNumber: index + 1,
          reps: getNumber(
            repsValue,
            10
          ),
          weight: weightValue,
        })
      );

      return {
        id: Number(raw.id),
        exerciseId,
        name:
          libraryExercise?.name ??
          raw.name ??
          "Exercise",
        difficulty:
          libraryExercise?.difficulty ??
          raw.difficulty,
        equipment:
          libraryExercise?.equipment ??
          raw.equipment,
        instructions:
          libraryExercise?.instructions ??
          raw.instructions,
        illustrations:
          libraryExercise?.illustrations ??
          raw.illustrations,
        muscles:
          libraryExercise?.muscles ??
          raw.muscles,
        sequenceNumber:
          Number(
            raw.sequenceNumber
          ),
        defaultSets:
          setsCountValue,
        defaultReps:
          String(repsValue),
        defaultRestTimeSeconds:
          restValue,
        durationMinutes:
          durationValue,
        defaultWeight:
          weightValue,
        sets,
        reps:
          getNumber(
            repsValue,
            10
          ),
        rest: restValue,
      };
    },
    []
  );

  const loadWorkoutData =
    useCallback(async () => {
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
          workoutRes.data.data as ApiWorkoutDetail;

        const fetchedLibrary =
          exercisesRes.data.data
            ?.exercises ??
          exercisesRes.data.data ??
          [];

        const normalizedLibrary =
          fetchedLibrary as LibraryExercise[];

        const normalizedExercises =
          (fetchedWorkout.exercises ??
            [])
            .map((exercise) =>
              normalizeExercise(
                exercise,
                normalizedLibrary
              )
            )
            .sort(
              (a, b) =>
                a.sequenceNumber -
                b.sequenceNumber
            );

        setWorkout({
          ...fetchedWorkout,
          exercises:
            normalizedExercises,
        });

        setWorkoutNameInput(
          fetchedWorkout.name ??
            "Workout Session"
        );

        setLibraryExercises(
          normalizedLibrary
        );

        setExercises(
          normalizedExercises
        );
      } catch (err) {
        console.error(
          "Failed to load workout details",
          err
        );
      } finally {
        setLoading(false);
      }
    }, [
      normalizeExercise,
      workoutId,
    ]);

  useEffect(() => {
    loadWorkoutData();
  }, [loadWorkoutData]);

  const toggleSelectExercise = (
    id: number
  ) => {
    setSelectedExerciseIds(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) => item !== id
            )
          : [...current, id]
    );
  };

  /**
   * Add existing library exercises to this workout/day.
   *
   * The POST only returns a success message, so the real source
   * of the new exercise-template ID is the subsequent GET.
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
        let nextSequence =
          exercises.length;

        for (const exerciseId of
          selectedExerciseIds) {
          const alreadyAssigned =
            exercises.some(
              (exercise) =>
                exercise.exerciseId ===
                exerciseId
            );

          if (alreadyAssigned) {
            continue;
          }

          await programService.addExerciseToWorkout(
            {
              workoutTemplateId:
                workoutId,
              exerciseId,
              sequenceNumber:
                nextSequence,
              defaultSets: 3,
              defaultReps: "10",
              defaultRestTimeSeconds:
                60,
              durationMinutes: 0,
              defaultWeight: 0,
            }
          );

          nextSequence += 1;
        }

        // Reload so IDs and all values come from the backend.
        await loadWorkoutData();

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

  const handleRemoveExercise = async (
    exerciseTemplateId: number
  ) => {
    try {
      await programService.deleteWorkoutExercise(
        exerciseTemplateId
      );

      await loadWorkoutData();
    } catch (err) {
      console.error(
        "Failed to remove exercise",
        err
      );
    }
  };

  /**
   * Persist the ordering using the exercise-template IDs.
   * The backend owns those IDs; the library exercise IDs are
   * never used as the identity for this operation.
   */
  const persistExerciseOrder =
    async (
      updatedExercises: AssignedExercise[]
    ) => {
      const ordered = updatedExercises.map(
        (exercise, index) => ({
          id: exercise.id,
          sequenceNumber:
            index,
        })
      );

      try {
        await programService.reorderExercises(
          workoutId,
          ordered
        );

        await loadWorkoutData();
      } catch (err) {
        console.error(
          "Failed to save exercise reordering",
          err
        );
      }
    };

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

    setExercises(
      updated
    );

    void persistExerciseOrder(
      updated
    );
  };

  const handleDragStart = (
    e: DragEvent,
    index: number
  ) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed =
      "move";
  };

  const handleDragOver = (
    e: DragEvent
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect =
      "move";
  };

  const handleDrop = (
    e: DragEvent,
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

    setExercises(
      updated
    );

    void persistExerciseOrder(
      updated
    );

    setDraggedIndex(null);
  };

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

  /**
   * Existing component callers can continue passing four arguments.
   * Duration is optional so the hook remains compatible while exposing
   * the duration field to the edit UI.
   */
  const handleEditExercise = (
    exercise: AssignedExercise,
    setsLen: number,
    repsVal: number,
    restVal: number,
    durationVal?: number
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

    setWeight(
      exercise.defaultWeight ??
        (Array.isArray(
          exercise.sets
        )
          ? exercise.sets[0]?.weight
          : 0) ??
        0
    );

    setDurationMinutes(
      durationVal ??
        exercise.durationMinutes ??
        0
    );
  };

  /**
   * Save all five editable workout-specific exercise fields.
   */
  const handleSaveReps =
    async () => {
      if (!editingExercise) {
        return;
      }

      const finalSetsCount =
        Math.max(
          1,
          setsCount === ""
            ? 3
            : getNumber(
                setsCount,
                3
              )
        );

      const finalRepsValue =
        repsCount === ""
          ? "10"
          : String(
              repsCount
            );

      const finalRestTime =
        Math.max(
          0,
          restTime === ""
            ? 60
            : getNumber(
                restTime,
                60
              )
        );

      const finalWeight =
        Math.max(
          0,
          weight === ""
            ? 0
            : getNumber(
                weight,
                0
              )
        );

      const finalDurationMinutes =
        Math.max(
          0,
          durationMinutes === ""
            ? 0
            : getNumber(
                durationMinutes,
                0
              )
        );

      try {
        await programService.updateWorkoutExercise(
          editingExercise.id,
          {
            defaultSets:
              finalSetsCount,
            defaultReps:
              finalRepsValue,
            defaultRestTimeSeconds:
              finalRestTime,
            durationMinutes:
              finalDurationMinutes,
            defaultWeight:
              finalWeight,
          }
        );

        await loadWorkoutData();

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

  const assignedExerciseIds =
    exercises.map(
      (exercise) =>
        exercise.exerciseId
    );

  const filteredLibrary =
    libraryExercises.filter(
      (libraryExercise) =>
        libraryExercise.name
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

    durationMinutes,
    setDurationMinutes,

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
