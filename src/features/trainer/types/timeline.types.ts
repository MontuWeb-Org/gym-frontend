export type WorkoutLogStatus = "in_progress" | "skipped" | "completed";

export type PlanAssignmentStatus = "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";

export interface WorkoutLogBrief {
  id: number;
  workoutTemplateId: number;
  durationMinutes: number;
  status: WorkoutLogStatus;
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  sequenceNumber: number;
  workoutLog?: WorkoutLogBrief;
}

export interface WeekTemplate {
  id: number;
  sequenceNumber: number;
  workouts: WorkoutTemplate[];
}

export interface PlanTemplate {
  id: number;
  name: string;
  description: string;
  trainerId: number;
}

export interface GetTraineeTimeline {
  currentWeekIdx: number;
  currentWorkoutIdx: number;
  status: PlanAssignmentStatus;
  startedAt: Date;
  planTemplate: PlanTemplate & {
    weekTemplates: WeekTemplate[];
  };
}

// Computed status for UI (not from API — derived from position + workoutLog)
export type WorkoutDisplayStatus =
  | "not_started"
  | "in_progress"
  | "skipped"
  | "completed"
  | "current";
