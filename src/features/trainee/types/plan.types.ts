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
