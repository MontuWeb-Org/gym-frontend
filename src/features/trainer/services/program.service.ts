import { authApi } from "@/lib/axios";

export const programService = {
  // Plan Templates
  getTemplates: (page = 1, limit = 10) =>
    authApi.get(`/plans/templates?page=${page}&limit=${limit}`),

  createTemplate: (data: {
    name: string;
    description: string;
  }) =>
    authApi.post("/plans/templates", data),

  getTemplateDetail: (planId: number) =>
    authApi.get(`/plans/templates/${planId}`),

  updatePlanTemplate: (
    planId: number,
    data: {
      name?: string;
      description?: string;
      status?: "DRAFT" | "ACTIVE";
    }
  ) =>
    authApi.put(
      `/plans/templates/${planId}`,
      data
    ),

  duplicateTemplate: (planId: number) =>
    authApi.post(
      `/plans/templates/${planId}/duplicate`
    ),

  deleteTemplate: (planId: number) =>
    authApi.delete(
      `/plans/templates/${planId}`
    ),

  // Week Templates
  createWeek: (data: {
    sequenceNumber: number;
    planTemplateId: number;
  }) =>
    authApi.post(
      "/plans/templates/weeks",
      {
        ...data,
        sequenceNumber: Math.max(
          1,
          Math.floor(data.sequenceNumber)
        ),
      }
    ),

  getWeekDetail: (weekId: number) =>
    authApi.get(`/plans/templates/weeks/${weekId}`),

  duplicateWeek: (weekId: number) =>
    authApi.post(
      `/plans/templates/weeks/${weekId}/duplicate`
    ),

  deleteWeek: (weekId: number) =>
    authApi.delete(
      `/plans/templates/weeks/${weekId}`
    ),

  // Workout Templates
  createWorkout: (data: {
    name: string;
    sequenceNumber: number;
    weekTemplateId: number;
  }) =>
    authApi.post(
      "/plans/templates/workouts",
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
      `/plans/templates/workouts/${workoutId}`,
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

  getWorkoutDetail: (workoutId: number) =>
    authApi.get(
      `/plans/templates/workouts/${workoutId}`
    ),

  duplicateWorkout: (workoutId: number) =>
    authApi.post(
      `/plans/templates/workouts/${workoutId}/duplicate`
    ),

  deleteWorkout: (workoutId: number) =>
    authApi.delete(
      `/plans/templates/workouts/${workoutId}`
    ),

  // Exercise Library
  getExercises: (
    page = 1,
    limit = 50
  ) =>
    authApi.get(
      `/exercises?page=${page}&limit=${limit}`
    ),

  // Workout Exercises
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
    authApi.post<{ message: string }>(
      "/plans/templates/exercises",
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

        durationMinutes: Math.max(
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
    authApi.put<{ message: string }>(
      `/plans/templates/exercises/${exerciseTemplateId}`,
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
              durationMinutes: Math.max(
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
      `/plans/templates/exercises/${exerciseTemplateId}`
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
      const exercise = normalized[index];

      await authApi.put<{
        message: string;
      }>(
        `/plans/templates/exercises/${exercise.id}`,
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
        `/plans/templates/exercises/${exercise.id}`,
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

  // Trainees
  getTrainees: (
    page = 1,
    limit = 10
  ) =>
    authApi.get(
      "/users/trainer/trainees",
      {
        params: {
          page,
          limit,
        },
      }
    ),

  // Plan Assignments
  getAssignments: (params?: {
    status?:
      | "IDLE"
      | "ACTIVE"
      | "COMPLETED";
    pageNumber?: number;
    pageSize?: number;
    sortBy?:
      | "createdAt"
      | "totalAmount";
    sortOrder?:
      | "asc"
      | "desc";
    traineeId?: number;
  }) =>
    authApi.get(
      "/plans/assignments",
      {
        params: {
          ...(params?.status !== undefined
            ? {
                status: params.status,
              }
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

  assignPlan: (data: {
    planTemplateId: number;
    traineeId: number;
  }) =>
    authApi.post<{
      data: {
        planAssignmentId: number;
      };
    }>(
      "/plans/assignments",
      data
    ),

  endAssignment: (
    assignmentId: number
  ) =>
    authApi.patch(
      `/plans/assignments/${assignmentId}/end`
    ),

  startAssignment: (
    assignmentId: number
  ) =>
    authApi.patch(
      `/plans/assignments/${assignmentId}/start`
    ),

  deleteAssignment: (
    assignmentId: number
  ) =>
    authApi.delete(
      `/plans/assignments/${assignmentId}`
    ),

  /*
   * Get a workout as it applies to a
   * specific trainee assignment.
   *
   * This is the endpoint we use when
   * editing reps for a trainee.
   *
   * It is NOT based on workout logs and
   * it does NOT modify the shared template.
   */
  getAssignedWorkoutDetail: (
    assignmentId: number,
    workoutId: number
  ) =>
    authApi.get<{
      data: {
        id: number;
        name: string;
        exercisesTemplates: Array<{
          id: number;
          reps: string | number | null;
          sets?: number | null;
          weight?: number | null;
          restSeconds?: number | null;
          exercise?: {
            id?: number;
            name?: string;
          } | null;
        }>;
      };
    }>(
      `/plans/assignments/${assignmentId}/workouts/${workoutId}`
    ),

  /*
   * Override exercises for ONE assignment.
   *
   * This does NOT modify the shared plan
   * template.
   */
  overridePlanExercises: (
    assignmentId: number,
    overrides: Array<{
      workoutExerciseTemplateId: number;
      sets?: number;
      weight?: number;
      reps?: string;
      restSeconds?: number;
    }>
  ) =>
    authApi.put<{
      message: string;
    }>(
      `/plans/assignments/${assignmentId}/overrides`,
      {
        overrides,
      }
    ),

  // Workout Logs
  getWorkoutLogs: (
    traineeId: number
  ) =>
    authApi.get(
      `/logs/workouts?traineeId=${traineeId}`
    ),

  getWorkoutLogDetail: (
    workoutLogId: number
  ) =>
    authApi.get(
      `/logs/workouts/${workoutLogId}`
    ),
};

