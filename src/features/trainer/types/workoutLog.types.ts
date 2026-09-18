export interface WorkoutLog {
  id: number;
  notes?: string;
  status:
    | "IN_PROGRESS"
    | "COMPLETED"
    | "SKIPPED";
  workoutTemplateId: number;
  planAssignmentId: number;
  traineeUserId: number;
  startedAt: string;
  endedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutLogDetail {
  id: number;
  planAssignmentId: number;
  workoutTemplateId: number;
  durationMinutes: number;
  status:
    | "IN_PROGRESS"
    | "COMPLETED"
    | "SKIPPED";
  notes?: string;

  exerciseLogs: Array<{
    id: number;
    exerciseName: string;
    workoutExerciseTemplateId: number;
    expectedSets: number;
    expectedReps: string;
    expectedWeight: number;
    expectedRestTimeSeconds: number;

    setLogs: Array<{
      id: number;
      exerciseLogId: number;
      reps: number;
      weight: number;
      durationSeconds: number;
      restTimeSeconds: number;
      sequenceNumber: number;
    }>;

    durationSeconds: number;
    sequenceNumber: number;
  }>;
}