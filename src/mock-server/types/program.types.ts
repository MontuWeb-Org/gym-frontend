export interface TemplatePlan {
  id: number;
  planId?: number;
  name: string;
  description: string;
  status: string;
  trainerId: number;
  durationWeekTemplates: number;
  isFav: boolean;
  weeks?: StoredWeek[];
}

export interface StoredWeek {
  id: number;
  weekId?: number;
  planTemplateId: number;
  sequenceNumber: number;
  name?: string;
  durationMinutes?: number;
  workoutTemplateCount?: number;
  workouts?: StoredWorkout[];
  [key: string]: unknown;
}

export interface StoredWorkout {
  id: number;
  workoutTemplateId?: number;
  weekTemplateId: number;
  name: string;
  sequenceNumber: number;
  durationMinutes?: number;
  exerciseTemplateCount?: number;
  [key: string]: unknown;
}

export interface StoredExercise {
  id: number;
  exerciseTemplateId?: number;
  exerciseId?: number;
  workoutTemplateId?: number;
  sequenceNumber?: number;
  [key: string]: unknown;
}

export interface PlanAssignment {
  id: number;
  planTemplateId: number;
  traineeId: number;
  createdAt: string;
  endedAt: string;
}

export interface TemplateBody {
  name: string;
  description: string;
  status?: string;
}

export interface WeekBody {
  sequenceNumber: number;
  planTemplateId: number;
}