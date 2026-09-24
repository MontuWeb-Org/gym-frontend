import { PlanAssignmentStatus } from "@/features/trainer/types/timeline.types";

export interface CurrentWorkoutBrief {
  workoutTemplateId: number;
  name: string;
  sequenceNumber: number;
  weekSequenceNumber: number;
}

export interface TraineeActivePlan {
  planId: number;
  name: string;
  status: PlanAssignmentStatus;
  startedAt: string;
  adherencePercentage: number;
  planTemplateId: number;
  currentWorkout?: CurrentWorkoutBrief;
  id?: number;
}

export interface GetTraineeActivePlanAssignmentsResponse {
  data: {
    activePlans: TraineeActivePlan[];
  };
}

// Alias for backwards compatibility
export type TraineeActivePlanAssignment = TraineeActivePlan;

export interface WorkoutExerciseDetails {
  id?: number;
  exerciseId: number;
  exerciseName: string;
  equipment: string[];
  instructions: string;
  difficulty: string;
  sequenceNumber: number;
  defaultSets: number;
  defaultReps: string;
  defaultWeight: number;
  defaultRestTimeSeconds: number;
}

export interface WorkoutDetailsResponse {
  id: number;
  name: string;
  sequenceNumber: number;
  weekTemplate: {
    id: number;
    sequenceNumber: number;
    planTemplate: PlanTemplateSummary;
  };
  exercisesTemplates: WorkoutExerciseTemplateDetails[];
}

export interface PlanTemplateSummary {
  id: number;
  name: string;
  description: string;
  trainerId: number;
}

export interface WorkoutExerciseTemplateDetails {
  id?: number;
  sequenceNumber: number;
  exercise: {
    id: number;
    name: string;
    equipment: string[];
    illustrations: string[];
    instructions: string;
    difficulty: string;
  };
  durationMinutes: number;
  sets: number;
  reps: string;
  weight: number;
  restSeconds: number;
}
