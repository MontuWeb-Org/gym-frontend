import { authApi } from "@/lib/axios";
import {
  TraineeActivePlan,
  WorkoutDetailsResponse,
  WorkoutExerciseDetails,
} from "../types/plan.types";

export const traineePlanService = {
  async getActivePlans(): Promise<TraineeActivePlan[]> {
    const response = await authApi.get<unknown>("/plans/assignments/active");

    const payload = response.data as Record<string, unknown> | unknown[];

    let rawList: unknown[] = [];

    if (Array.isArray(payload)) {
      rawList = payload;
    } else if (payload && typeof payload === "object") {
      // Check response.data.data.activePlans
      const dataProp = (payload as { data?: unknown }).data;
      if (
        dataProp &&
        typeof dataProp === "object" &&
        "activePlans" in dataProp &&
        Array.isArray((dataProp as { activePlans: unknown[] }).activePlans)
      ) {
        rawList = (dataProp as { activePlans: unknown[] }).activePlans;
      }
      // Check response.data.activePlans
      else if (
        "activePlans" in payload &&
        Array.isArray((payload as { activePlans: unknown[] }).activePlans)
      ) {
        rawList = (payload as { activePlans: unknown[] }).activePlans;
      }
      // Check response.data.data (if array)
      else if (Array.isArray(dataProp)) {
        rawList = dataProp;
      }
    }

    return rawList.map((item) => {
      const obj = item as Record<string, unknown>;
      const planId = Number(obj.planId ?? obj.id);
      return {
        ...obj,
        planId,
        id: planId,
      } as TraineeActivePlan;
    });
  },

  async getWorkoutDetails(
    assignmentId: number,
    workoutId: number
  ): Promise<WorkoutExerciseDetails[]> {
    const response = await authApi.get<{ data: WorkoutDetailsResponse }>(
      `/plans/assignments/${assignmentId}/workouts/${workoutId}`
    );
    return response.data.data.exercisesTemplates.map((template) => {
      return {
        id: template.id,
        exerciseId: template.exercise.id,
        exerciseName: template.exercise.name,
        equipment: template.exercise.equipment,
        instructions: template.exercise.instructions,
        difficulty: template.exercise.difficulty,
        sequenceNumber: template.sequenceNumber,
        defaultSets: template.sets,
        defaultReps: template.reps,
        defaultWeight: template.weight,
        defaultRestTimeSeconds: template.restSeconds,
      };
    });
  },
};
