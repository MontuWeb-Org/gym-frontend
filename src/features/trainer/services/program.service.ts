import { authApi } from "@/lib/axios";

export const programService = {
  // ---------------------------------------------------------------------------
  // Plan Templates
  // ---------------------------------------------------------------------------

  getTemplates: (
    page = 1,
    limit = 10
  ) =>
    authApi.get(
      `/api/plans/templates?page=${page}&limit=${limit}`
    ),

  createTemplate: (data: {
    name: string;
    description: string;
  }) =>
    authApi.post(
      "/api/plans/templates",
      data
    ),

  getTemplateDetail: (
    planId: number
  ) =>
    authApi.get(
      `/api/plans/templates/${planId}`
    ),

  updatePlanTemplate: (
    planId: number,
    data: {
      name?: string;
      description?: string;
      status?: "DRAFT" | "ACTIVE";
    }
  ) =>
    authApi.put(
      `/api/plans/templates/${planId}`,
      data
    ),

  duplicateTemplate: (
    planId: number
  ) =>
    authApi.post(
      `/api/plans/templates/${planId}/duplicate`
    ),

  deleteTemplate: (
    planId: number
  ) =>
    authApi.delete(
      `/api/plans/templates/${planId}`
    ),

  // ---------------------------------------------------------------------------
  // Week Templates
  // ---------------------------------------------------------------------------

  createWeek: (data: {
    sequenceNumber: number;
    planTemplateId: number;
  }) =>
    authApi.post(
      "/api/plans/templates/weeks",
      data
    ),

  getWeekDetail: (
    weekId: number
  ) =>
    authApi.get(
      `/api/plans/templates/weeks/${weekId}`
    ),

  duplicateWeek: (
    weekId: number
  ) =>
    authApi.post(
      `/api/plans/templates/weeks/${weekId}/duplicate`
    ),

  deleteWeek: (
    weekId: number
  ) =>
    authApi.delete(
      `/api/plans/templates/weeks/${weekId}`
    ),

  // ---------------------------------------------------------------------------
  // Workout Templates
  // ---------------------------------------------------------------------------

  createWorkout: (data: {
    name: string;
    sequenceNumber: number;
    weekTemplateId: number;
  }) =>
    authApi.post(
      "/api/plans/templates/workouts",
      data
    ),

  updateWorkout: (
    workoutId: number,
    data: {
      name?: string;
      sequenceNumber?: number;
    }
  ) =>
    authApi.put(
      `/api/plans/templates/workouts/${workoutId}`,
      data
    ),

  getWorkoutDetail: (
    workoutId: number
  ) =>
    authApi.get(
      `/api/plans/templates/workouts/${workoutId}`
    ),

  duplicateWorkout: (
    workoutId: number
  ) =>
    authApi.post(
      `/api/plans/templates/workouts/${workoutId}/duplicate`
    ),

  deleteWorkout: (
    workoutId: number
  ) =>
    authApi.delete(
      `/api/plans/templates/workouts/${workoutId}`
    ),

   // ---------------------------------------------------------------------------
  // Exercise Library & Workout Exercises
  // ---------------------------------------------------------------------------

  getExercises: (
    page = 1,
    limit = 50
  ) =>
    authApi.get(
      `/api/exercises?page=${page}&limit=${limit}`
    ),

  /**
   * Attach an existing library exercise to one workout/day.
   *
   * The real API returns only a success message (201); it does
   * NOT return the newly-created ExerciseTemplate.
   */
  addExerciseToWorkout: (data: {
    exerciseId: number;
    workoutTemplateId: number;
    sequenceNumber: number;
    defaultReps: string;
    defaultSets: number;
    defaultRestTimeSeconds: number;
    durationMinutes: number;
    defaultWeight: number;
  }) =>
    authApi.post<{
      message: string;
    }>(
      "/api/plans/templates/exercises",
      data
    ),

  /**
   * Update the configuration of an existing exercise-template
   * inside a workout/day.
   */
  updateWorkoutExercise: (
    exerciseTemplateId: number,
    data: {
      sequenceNumber?: number;
      defaultReps?: string;
      defaultSets?: number;
      defaultRestTimeSeconds?: number;
      durationMinutes?: number;
      defaultWeight?: number;
    }
  ) =>
    authApi.put<{
      message: string;
    }>(
      `/api/plans/templates/exercises/${exerciseTemplateId}`,
      data
    ),

  deleteWorkoutExercise: (
    exerciseTemplateId: number
  ) =>
    authApi.delete(
      `/api/plans/templates/exercises/${exerciseTemplateId}`
    ),

  reorderExercises: (
    workoutId: number,
    exercises: Array<{
      id: number;
      sequenceNumber: number;
    }>
  ) =>
    authApi.put(
      `/api/plans/templates/workouts/${workoutId}/exercises/reorder`,
      { exercises }
    ),

  // ---------------------------------------------------------------------------
  // Trainees & Plan Assignments
  // ---------------------------------------------------------------------------

  getTrainees: (
    page = 1,
    limit = 10
  ) =>
    authApi.get(
      `/api/users/trainer/trainees?page=${page}&limit=${limit}`
    ),

  getAssignments: () =>
    authApi.get(
      "/api/plans/assignments"
    ),

  assignPlan: (data: {
    planTemplateId: number;
    traineeId: number;
    createdAt: string;
    endedAt: string;
  }) =>
    authApi.post(
      "/api/plans/assignments",
      data
    ),

  updateAssignment: (
    assignmentId: number,
    data: {
      createdAt?: string;
      endedAt?: string;
    }
  ) =>
    authApi.put(
      `/api/plans/assignments/${assignmentId}`,
      data
    ),

  deleteAssignment: (
    assignmentId: number
  ) =>
    authApi.delete(
      `/api/plans/assignments/${assignmentId}`
    ),

  // ---------------------------------------------------------------------------
  // Workout Logs
  // ---------------------------------------------------------------------------

  /**
   * Get all workout session logs for a trainee.
   *
   * The returned logs contain planAssignmentId,
   * so the caller can filter them to a specific
   * program assignment.
   */
  getWorkoutLogs: (
    traineeId: number
  ) =>
    authApi.get(
      `/api/logs/workouts?traineeId=${traineeId}`
    ),

  /**
   * Get the complete details of one workout session,
   * including its exercise logs and sets.
   */
  getWorkoutLogDetail: (
    workoutLogId: number
  ) =>
    authApi.get(
      `/api/logs/workouts/${workoutLogId}`
    ),
};