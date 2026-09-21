"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { programService } from "../services/program.service";

interface WorkoutItem {
  id: number;
  workoutTemplateId?: number;
  name: string;
  sequenceNumber: number;
}

export function useWeekBuilder() {
  const params = useParams();
  const router = useRouter();

  const templateId =
    Number(params.templateId);

  const weekId =
    Number(params.weekId);

  const workoutId =
    params.workoutId
      ? Number(params.workoutId)
      : null;

  const [workouts, setWorkouts] =
    useState<WorkoutItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  const [
    workoutName,
    setWorkoutName,
  ] = useState("");

  /*
   * Load all workouts belonging
   * to the current week.
   */
  useEffect(() => {
    async function loadWeek() {
      if (!weekId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res =
          await programService.getWeekDetail(
            weekId
          );

        setWorkouts(
          res?.data?.data
            ?.workouts ||
            res?.data?.workouts ||
            []
        );
      } catch (err) {
        console.error(
          "Failed to load week details",
          err
        );
      } finally {
        setLoading(false);
      }
    }

    loadWeek();
  }, [weekId]);

  /*
   * Keep the workout tabs in sync when
   * WorkoutBuilderView changes a workout name.
   */
  useEffect(() => {
    const handleWorkoutNameUpdated = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<{
          workoutId: number;
          name: string;
        }>;

      const {
        workoutId: updatedWorkoutId,
        name,
      } = customEvent.detail;

      setWorkouts(
        (currentWorkouts) =>
          currentWorkouts.map(
            (workout) =>
              workout.id ===
              updatedWorkoutId
                ? {
                    ...workout,
                    name,
                  }
                : workout
          )
      );
    };

    window.addEventListener(
      "workoutNameUpdated",
      handleWorkoutNameUpdated
    );

    return () => {
      window.removeEventListener(
        "workoutNameUpdated",
        handleWorkoutNameUpdated
      );
    };
  }, []);

  /*
   * Create a new workout day.
   */
  const handleAddWorkout =
    async () => {
      if (
        !workoutName ||
        !workoutName.trim()
      ) {
        return;
      }

      try {
        const res =
          await programService.createWorkout(
            {
              name:
                workoutName.trim(),

              sequenceNumber:
                workouts.length,

              weekTemplateId:
                weekId,
            }
          );

        const newWorkout =
          res?.data?.data ||
          res?.data ||
          {};

        const newWorkoutId =
          Number(
            newWorkout.workoutTemplateId ??
              newWorkout.id
          );

        if (!Number.isFinite(newWorkoutId)) {
          throw new Error("Create workout response did not contain a workout ID.");
        }

        setWorkouts([
          ...workouts,
          {
            id: newWorkoutId,

            name:
              workoutName.trim(),

            sequenceNumber:
              workouts.length,
          },
        ]);

        setIsModalOpen(
          false
        );

        setWorkoutName("");

        router.push(
          `/trainer/template/${templateId}/${weekId}/${newWorkoutId}`
        );
      } catch (err) {
        console.error(
          "Failed to create workout",
          err
        );
      }
    };

  /*
   * Duplicate an existing workout day.
   */
  const handleDuplicateWorkout =
    async (
      workoutIdToDuplicate: number
    ) => {
      try {
        await programService.duplicateWorkout(
          workoutIdToDuplicate
        );

        const res =
          await programService.getWeekDetail(
            weekId
          );

        setWorkouts(
          res?.data?.data
            ?.workouts ||
            res?.data?.workouts ||
            []
        );
      } catch (err) {
        console.error(
          "Failed to duplicate workout",
          err
        );
      }
    };

  /*
   * Delete an existing workout day.
   */
  const handleDeleteWorkout =
    async (
      workoutIdToDelete: number
    ) => {
      const workout =
        workouts.find(
          (item) =>
            item.id ===
            workoutIdToDelete
        );

      if (
        !window.confirm(
          `Delete ${
            workout?.name ||
            "this workout day"
          }? This will also delete all exercises inside it.`
        )
      ) {
        return;
      }

      try {
        await programService.deleteWorkout(
          workoutIdToDelete
        );

        const updatedWorkouts =
          workouts
            .filter(
              (workout) =>
                workout.id !==
                workoutIdToDelete
            )
            .map(
              (
                workout,
                index
              ) => ({
                ...workout,
                sequenceNumber:
                  index,
              })
            );

        setWorkouts(
          updatedWorkouts
        );

        /*
         * If the deleted workout is the
         * one currently open, return to
         * the week page.
         */
        if (
          workoutId ===
          workoutIdToDelete
        ) {
          router.push(
            `/trainer/template/${templateId}/${weekId}`
          );
        }
      } catch (err) {
        console.error(
          "Failed to delete workout",
          err
        );
      }
    };

  /*
   * Open the create-workout modal
   * with the next day name.
   */
  const openCreateModal =
    () => {
      setWorkoutName(
        `Day ${
          workouts.length + 1
        }`
      );

      setIsModalOpen(
        true
      );
    };

  return {
    templateId,
    weekId,
    workoutId,

    workouts,
    loading,

    isModalOpen,
    setIsModalOpen,

    workoutName,
    setWorkoutName,

    handleAddWorkout,
    handleDuplicateWorkout,
    handleDeleteWorkout,
    openCreateModal,

    router,
  };
}