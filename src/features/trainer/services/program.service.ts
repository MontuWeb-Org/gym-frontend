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
      {
        ...data,
        sequenceNumber: Math.max(
          1,
          Math.floor(data.sequenceNumber)
        ),
      }
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
      {
        ...data,
        sequenceNumber: Math.max(
          1,
          Math.floor(data.sequenceNumber)
        ),
      }
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
      {
        ...data,
        ...(data.sequenceNumber !== undefined
          ? {
              sequenceNumber: Math.max(
                1,
                Math.floor(data.sequenceNumber)
              ),
            }
          : {}),
      }
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
  // Exercise Library
  // ---------------------------------------------------------------------------

  getExercises: (
    page = 1,
    limit = 50
  ) =>
    authApi.get(
      `/api/exercises?page=${page}&limit=${limit}`
    ),

  // ---------------------------------------------------------------------------
  // Workout Exercises
  // ---------------------------------------------------------------------------

  addExerciseToWorkout: (data: {
    exerciseId: number;
    workoutTemplateId: number;
    sequenceNumber: number;
    defaultReps: string;
    defaultSets: number;
    defaultRestTimeSeconds: number;
    defaultDurationMinutes: number;
    defaultWeight: number;
  }) =>
    authApi.post<{
      message: string;
    }>(
      "/api/plans/templates/exercises",
      {
        exerciseId: data.exerciseId,
        workoutTemplateId:
          data.workoutTemplateId,
        sequenceNumber: Math.max(
          1,
          Math.floor(data.sequenceNumber)
        ),
        defaultReps: String(
          data.defaultReps
        ),
        defaultSets: Math.max(
          1,
          Math.floor(data.defaultSets)
        ),
        defaultRestTimeSeconds: Math.max(
          0,
          Math.floor(
            data.defaultRestTimeSeconds
          )
        ),
        defaultDurationMinutes: Math.max(
          1,
          Math.floor(
            data.defaultDurationMinutes
          )
        ),
        defaultWeight: Math.max(
          0,
          Number(data.defaultWeight)
        ),
      }
    ),

  updateWorkoutExercise: (
    exerciseTemplateId: number,
    data: {
      sequenceNumber?: number;
      defaultReps?: string;
      defaultSets?: number;
      defaultRestTimeSeconds?: number;
      defaultDurationMinutes?: number;
      defaultWeight?: number;
    }
  ) =>
    authApi.put<{
      message: string;
    }>(
      `/api/plans/templates/exercises/${exerciseTemplateId}`,
      {
        ...(data.sequenceNumber !== undefined
          ? {
              sequenceNumber: Math.max(
                1,
                Math.floor(
                  data.sequenceNumber
                )
              ),
            }
          : {}),

        ...(data.defaultReps !== undefined
          ? {
              defaultReps: String(
                data.defaultReps
              ),
            }
          : {}),

        ...(data.defaultSets !== undefined
          ? {
              defaultSets: Math.max(
                1,
                Math.floor(
                  data.defaultSets
                )
              ),
            }
          : {}),

        ...(data.defaultRestTimeSeconds !==
        undefined
          ? {
              defaultRestTimeSeconds:
                Math.max(
                  0,
                  Math.floor(
                    data.defaultRestTimeSeconds
                  )
                ),
            }
          : {}),

        ...(data.defaultDurationMinutes !==
        undefined
          ? {
              defaultDurationMinutes:
                Math.max(
                  1,
                  Math.floor(
                    data.defaultDurationMinutes
                  )
                ),
            }
          : {}),

        ...(data.defaultWeight !== undefined
          ? {
              defaultWeight: Math.max(
                0,
                Number(data.defaultWeight)
              ),
            }
          : {}),
      }
    ),

  deleteWorkoutExercise: (
    exerciseTemplateId: number
  ) =>
    authApi.delete(
      `/api/plans/templates/exercises/${exerciseTemplateId}`
    ),

  reorderExercises: async (
    workoutId: number,
    exercises: Array<{
      id: number;
      sequenceNumber: number;
    }>
  ) => {
    void workoutId;

    const normalized = exercises.map(
      (exercise, index) => ({
        id: Number(exercise.id),
        sequenceNumber: index + 1,
      })
    );

    for (const exercise of normalized) {
      if (
        !Number.isInteger(exercise.id) ||
        exercise.id <= 0
      ) {
        throw new Error(
          `Invalid ExerciseTemplate id: ${exercise.id}`
        );
      }
    }

    for (
      let index = 0;
      index < normalized.length;
      index += 1
    ) {
      const exercise =
        normalized[index];

      await authApi.put<{
        message: string;
      }>(
        `/api/plans/templates/exercises/${exercise.id}`,
        {
          sequenceNumber:
            1000000 + index + 1,
        }
      );
    }

    for (const exercise of normalized) {
      await authApi.put<{
        message: string;
      }>(
        `/api/plans/templates/exercises/${exercise.id}`,
        {
          sequenceNumber:
            exercise.sequenceNumber,
        }
      );
    }

    return {
      data: {
        message:
          "Exercise order updated successfully",
      },
    };
  },

  // ---------------------------------------------------------------------------
  // Trainees
  // ---------------------------------------------------------------------------

  getTrainees: (
    page = 1,
    limit = 10
  ) =>
    authApi.get(
      "/api/users/trainer/trainees",
      {
        params: {
          page,
          limit,
        },
      }
    ),

  // ---------------------------------------------------------------------------
  // Plan Assignments
  // ---------------------------------------------------------------------------

  getAssignments: (params?: {
    status?: "IDLE" | "ACTIVE" | "COMPLETED";
    pageNumber?: number;
    pageSize?: number;
    sortBy?: "createdAt" | "totalAmount";
    sortOrder?: "asc" | "desc";
    traineeId?: number;
  }) =>
    authApi.get(
      "/api/plans/assignments",
      {
        params: {
          ...(params?.status !== undefined
            ? { status: params.status }
            : {}),

          pageNumber:
            params?.pageNumber ?? 1,

          pageSize:
            params?.pageSize ?? 10,

          sortBy:
            params?.sortBy ?? "createdAt",

          sortOrder:
            params?.sortOrder ?? "desc",

          ...(params?.traineeId !== undefined
            ? {
                traineeId:
                  params.traineeId,
              }
            : {}),
        },
      }
    ),

  /**
   * Assign an existing plan template to a trainee.
   *
   * Backend request body:
   * {
   *   planTemplateId: number;
   *   traineeId: number;
   * }
   *
   * The backend creates the assignment dates/status.
   */
  assignPlan: (data: {
    planTemplateId: number;
    traineeId: number;
  }) =>
    authApi.post<{
      data: {
        planAssignmentId: number;
      };
    }>(
      "/api/plans/assignments",
      data
    ),

  /**
   * End an active plan assignment.
   *
   * Backend endpoint:
   * PATCH /api/plans/assignments/:assignmentId/end
   */
  endAssignment: (
    assignmentId: number
  ) =>
    authApi.patch(
      `/api/plans/assignments/${assignmentId}/end`
    ),

  /**
   * Start an IDLE plan assignment.
   *
   * Backend endpoint:
   * PATCH /api/plans/assignments/:assignmentId/start
   */
  startAssignment: (
    assignmentId: number
  ) =>
    authApi.patch(
      `/api/plans/assignments/${assignmentId}/start`
    ),

  /**
   * Delete a plan assignment.
   */
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
   */
  getWorkoutLogs: (
    traineeId: number
  ) =>
    authApi.get(
      `/api/logs/workouts?traineeId=${traineeId}`
    ),

  /**
   * Get the complete details of one workout session,
   * including exercise logs and sets.
   */
  getWorkoutLogDetail: (
    workoutLogId: number
  ) =>
    authApi.get(
      `/api/logs/workouts/${workoutLogId}`
    ),
};