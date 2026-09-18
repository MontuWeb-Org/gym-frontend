export interface WorkoutLog {
  id: number;
  status: string;
  workoutTemplateId: number;
  planAssignmentId: number;
  traineeUserId: number;
  startedAt: string;
  endedAt: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface WorkoutLogDetail extends WorkoutLog {
  exerciseLogs: Array<{
    id: number;
    exerciseId: number;
    exerciseName: string;
    sets: Array<{
      setNumber: number;
      reps: number;
    }>;
    durationMinutes: number;
  }>;
}