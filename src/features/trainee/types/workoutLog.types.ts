export interface SetLogDraft {
  reps: number;
  weight: number;
  restTimeSeconds: number;
  startedAt: string;
  endedAt: string;
  sequenceNumber: number;
}

export interface ExerciseLogDraft {
  tempId: string;
  workoutExerciseTemplateId: number;
  sequenceNumber: number;
  planAssignmentId: number;
  sets: SetLogDraft[];
  startedAt: string;
  endedAt: string;
  synced: boolean;
}

export interface WorkoutSession {
  tempId: string;
  workoutLogId: number | null; // null until start syncs
  planAssignmentId: number;
  workoutTemplateId: number;
  startedAt: string;
  endedAt: string | null;
  notes?: string;
  status: 'in-progress' | 'completed';
  pendingStart: boolean;
  exercises: ExerciseLogDraft[];
}

export interface StartWorkoutPayload {
  planAssignmentId: number;
  workoutTemplateId: number;
  startedAt: string;
}

export interface LogExercisePayload {
  workoutLogId?: number;
  workoutExerciseTemplateId: number;
  sequenceNumber: number;
  planAssignmentId: number;
  sets: SetLogDraft[];
  startedAt: string;
  endedAt: string;
}

export interface CompleteWorkoutPayload {
  endedAt: string;
  notes?: string;
}