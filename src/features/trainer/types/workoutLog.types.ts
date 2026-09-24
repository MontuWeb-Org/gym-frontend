export interface WorkoutLog {
  workoutLogId: number;
  notes?: string | null;

  status:
    | "IN_PROGRESS"
    | "COMPLETED"
    | "SKIPPED";

  planAssignmentId: number;
  workoutTemplateId: number;
  workoutTemplateName: string;

  exerciseTemplateCount: number;
  exerciseLogsCount: number;

  durationMinutes: number;
}

export interface WorkoutLogDetail {
  workoutLogId: number;
  planAssignmentId: number;
  workoutTemplateId: number;
  durationMinutes: number;

  workoutTemplateName: string;
  exerciseTemplateCount: number;

  status:
    | "IN_PROGRESS"
    | "COMPLETED"
    | "SKIPPED";

  notes?: string | null;

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

