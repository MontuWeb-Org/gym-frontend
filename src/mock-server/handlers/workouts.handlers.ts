import {
  http,
  HttpResponse,
} from "msw";

import exercisesData from "../data/exercises.json";

import {
  StoredExercise,
  StoredWorkout,
  PlanAssignment,
} from "../types/program.types";

import {
  getNextId,
  getTemplates,
  getTemplateWeeks,
  getWeekWorkouts,
  getWorkoutExercises,
  getWeeksStore,
  getWorkoutsStore,
  getExercisesStore,
  saveWeeksStore,
  saveWorkoutsStore,
  saveExercisesStore,
  getAssignments,
} from "../utils/templateHelpers";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface WorkoutLog {
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

interface WorkoutLogDetail {
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
};

/*
 * Generated mock logs are kept here so the
 * detail endpoint can find the workout that
 * belongs to each generated session.
 */
const mockWorkoutLogs = new Map<
  number,
  WorkoutLog
>();

/* -------------------------------------------------------------------------- */
/* WORKOUT HELPERS                                                            */
/* -------------------------------------------------------------------------- */

function findWorkout(
  workoutId: number
): {
  workout: StoredWorkout;
  weekId: number;
} | null {
  const workoutsStore =
    getWorkoutsStore();

  for (const [
    weekKey,
    workouts,
  ] of Object.entries(
    workoutsStore
  )) {
    const workout =
      workouts.find(
        (item) =>
          Number(item.id) ===
            workoutId ||
          Number(
            item.workoutTemplateId
          ) === workoutId
      );

    if (workout) {
      return {
        workout,
        weekId:
          Number(
            workout.weekTemplateId
          ) ||
          Number(weekKey),
      };
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* MOCK WORKOUT LOGS                                                          */
/* -------------------------------------------------------------------------- */

function createMockLogsForAssignment(
  assignment: PlanAssignment
): WorkoutLog[] {
  const templates =
    getTemplates();

  const template =
    templates.find(
      (item) =>
        Number(item.id) ===
          Number(
            assignment.planTemplateId
          ) ||
        Number(item.planId) ===
          Number(
            assignment.planTemplateId
          )
    );

  if (!template) {
    return [];
  }

  const weeks =
    getTemplateWeeks(
      template
    );

  const logs: WorkoutLog[] = [];

  let workoutIndex = 0;

  for (const week of weeks) {
    const workouts =
      getWeekWorkouts(week);

    for (const workout of workouts) {
      /*
       * Generate a unique mock log ID.
       */
      const logId =
        Date.now() +
        Number(
          assignment.id
        ) *
          1000 +
        workoutIndex;

      /*
       * Make every workout look like
       * a session completed by the
       * trainee on a different day.
       */
      const daysAgo =
        workoutIndex * 2 + 1;

      const endedAtDate =
        new Date(
          Date.now() -
            daysAgo *
              24 *
              60 *
              60 *
              1000
        );

      /*
       * Use the workout's configured
       * duration when available.
       *
       * Otherwise generate a mock
       * duration.
       */
      const durationMinutes =
        Number(
          workout.durationMinutes
        ) > 0
          ? Number(
              workout.durationMinutes
            )
          : 30 +
            (workoutIndex % 4) *
              5;

      const startedAtDate =
        new Date(
          endedAtDate.getTime() -
            durationMinutes *
              60 *
              1000
        );

      const startedAt =
        startedAtDate.toISOString();

      const endedAt =
        endedAtDate.toISOString();

      const log: WorkoutLog = {
        id: logId,
        status:
          "COMPLETED",
        workoutTemplateId:
          Number(workout.id),
        planAssignmentId:
          Number(
            assignment.id
          ),
        traineeUserId:
          Number(
            assignment.traineeId
          ),
        startedAt,
        endedAt,
        createdAt: startedAt,
        updatedAt: endedAt,
        notes:
          "Workout completed by trainee.",
      };

      logs.push(log);

      /*
       * Keep the generated log so
       * the detail endpoint can
       * resolve it later.
       */
      mockWorkoutLogs.set(
        logId,
        log
      );

      workoutIndex += 1;
    }
  }

  return logs;
}

/* -------------------------------------------------------------------------- */
/* CREATE WORKOUT                                                             */
/* -------------------------------------------------------------------------- */

const createWorkoutResolver =
  async ({
    request,
  }: {
    request: Request;
  }) => {
    const body =
      (await request.json()) as {
        name: string;
        sequenceNumber: number;
        weekTemplateId:
          | number
          | string;
      };

    const workoutsStore =
      getWorkoutsStore();

    const allWorkouts =
      Object.values(
        workoutsStore
      ).flat();

    const newWorkoutId =
      getNextId(
        allWorkouts
      );

    const weekTemplateId =
      Number(
        body.weekTemplateId
      );

    const newWorkout:
      StoredWorkout = {
      id: newWorkoutId,
      workoutTemplateId:
        newWorkoutId,
      name: body.name,
      sequenceNumber:
        body.sequenceNumber,
      weekTemplateId,
      exercises: [],
    };

    const weekKey =
      String(
        weekTemplateId
      );

    workoutsStore[weekKey] = [
      ...(workoutsStore[
        weekKey
      ] || []),
      newWorkout,
    ];

    saveWorkoutsStore(
      workoutsStore
    );

    return HttpResponse.json(
      {
        data: newWorkout,
      },
      {
        status: 200,
      }
    );
  };

/* -------------------------------------------------------------------------- */
/* UPDATE WORKOUT                                                             */
/* -------------------------------------------------------------------------- */

const updateWorkoutResolver =
  async ({
    params,
    request,
  }: {
    params: {
      workoutId?: string;
    };
    request: Request;
  }) => {
    const workoutId =
      Number(
        params.workoutId
      );

    if (
      !Number.isFinite(
        workoutId
      )
    ) {
      return HttpResponse.json(
        {
          message:
            "Workout template not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      (await request.json()) as {
        name?: string;
        sequenceNumber?: number;
      };

    const workoutsStore =
      getWorkoutsStore();

    let updatedWorkout:
      | StoredWorkout
      | null = null;

    for (const workouts of Object.values(
      workoutsStore
    )) {
      const workout =
        workouts.find(
          (item) =>
            Number(item.id) ===
              workoutId ||
            Number(
              item.workoutTemplateId
            ) === workoutId
        );

      if (!workout) {
        continue;
      }

      if (
        body.name !==
        undefined
      ) {
        workout.name =
          body.name;
      }

      if (
        body.sequenceNumber !==
        undefined
      ) {
        workout.sequenceNumber =
          body.sequenceNumber;
      }

      updatedWorkout =
        workout;

      break;
    }

    if (!updatedWorkout) {
      return HttpResponse.json(
        {
          message:
            "Workout template not found.",
        },
        {
          status: 404,
        }
      );
    }

    saveWorkoutsStore(
      workoutsStore
    );

    return HttpResponse.json(
      {
        data: updatedWorkout,
      },
      {
        status: 200,
      }
    );
  };

/**
 * Convert the internal MSW exercise-template store into the documented
 * API representation.
 *
 * The store may keep legacy/defaultDurationMinutes internally, but the
 * API contract is durationMinutes and nests the existing library exercise
 * under `exercise`.
 */
function toApiExerciseTemplate(
  exercise: StoredExercise
): Record<string, unknown> {
  const exerciseId = Number(
    exercise.exerciseId
  );

  const libraryExercise = (
    exercisesData as Array<{
      id: number;
      [key: string]: unknown;
    }>
  ).find(
    (item) =>
      Number(item.id) ===
      exerciseId
  );

  return {
    id: Number(exercise.id),
    exercise:
      libraryExercise ?? {
        id: exerciseId,
        name: "Exercise",
      },
    workoutTemplateId:
      Number(
        exercise.workoutTemplateId
      ),
    sequenceNumber:
      Number(
        exercise.sequenceNumber
      ),
    defaultReps:
      String(
        exercise.defaultReps ?? "10"
      ),
    defaultSets:
      Number(
        exercise.defaultSets ?? 3
      ),
    defaultRestTimeSeconds:
      Number(
        exercise.defaultRestTimeSeconds ??
          60
      ),
    durationMinutes:
      Number(
        exercise.defaultDurationMinutes ??
          0
      ),
    defaultWeight:
      Number(
        exercise.defaultWeight ?? 0
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* GET WORKOUT DETAIL                                                         */
/* -------------------------------------------------------------------------- */

const getWorkoutDetailResolver = ({
  params,
}: {
  params: {
    workoutId?: string;
  };
}) => {
  const workoutId =
    Number(
      params.workoutId
    );

  if (
    !Number.isFinite(
      workoutId
    )
  ) {
    return HttpResponse.json(
      {
        message:
          "Workout template not found.",
      },
      {
        status: 404,
      }
    );
  }

  const result =
    findWorkout(
      workoutId
    );

  if (!result) {
    return HttpResponse.json(
      {
        message:
          "Workout template not found.",
      },
      {
        status: 404,
      }
    );
  }

  const exercisesStore =
    getExercisesStore();

  const exercises =
    getWorkoutExercisesForWorkout(
      result.workout,
      exercisesStore
    );

  return HttpResponse.json(
    {
      data: {
        ...result.workout,
        exercises:
          exercises.map(
            toApiExerciseTemplate
          ),
      },
    },
    {
      status: 200,
    }
  );
};

function getWorkoutExercisesForWorkout(
  workout: StoredWorkout,
  exercisesStore: Record<
    string,
    StoredExercise[]
  >
): StoredExercise[] {
  return getWorkoutExercisesFromStore(
    workout,
    exercisesStore
  );
}

function getWorkoutExercisesFromStore(
  workout: StoredWorkout,
  exercisesStore: Record<
    string,
    StoredExercise[]
  >
): StoredExercise[] {
  const directExercises =
    exercisesStore[
      String(workout.id)
    ] || [];

  if (
    directExercises.length > 0
  ) {
    return directExercises;
  }

  return Object.values(
    exercisesStore
  )
    .flat()
    .filter(
      (exercise) =>
        Number(
          exercise.workoutTemplateId
        ) ===
        Number(
          workout.id
        )
    );
}

/* -------------------------------------------------------------------------- */
/* DUPLICATE WORKOUT                                                          */
/* -------------------------------------------------------------------------- */

const duplicateWorkoutResolver = ({
  params,
}: {
  params: {
    workoutId?: string;
  };
}) => {
  const workoutId =
    Number(
      params.workoutId
    );

  if (
    !Number.isFinite(
      workoutId
    )
  ) {
    return HttpResponse.json(
      {
        message:
          "Workout template not found.",
      },
      {
        status: 404,
      }
    );
  }

  const result =
    findWorkout(
      workoutId
    );

  if (!result) {
    return HttpResponse.json(
      {
        message:
          "Workout template not found.",
      },
      {
        status: 404,
      }
    );
  }

  const workoutsStore =
    getWorkoutsStore();

  const exercisesStore =
    getExercisesStore();

  const allWorkouts =
    Object.values(
      workoutsStore
    ).flat();

  const allExercises =
    Object.values(
      exercisesStore
    ).flat();

  /*
   * Generate IDs from all existing
   * stored items and increment them
   * manually so every duplicated item
   * receives a unique ID.
   */
  let nextWorkoutId =
    getNextId(
      allWorkouts
    );

  let nextExerciseId =
    getNextId(
      allExercises
    );

  const newWorkoutId =
    nextWorkoutId;

  nextWorkoutId += 1;

  const originalExercises =
    getWorkoutExercisesFromStore(
      result.workout,
      exercisesStore
    );

  const newWorkoutExercises:
    StoredExercise[] = [];

  for (
    let index = 0;
    index <
    originalExercises.length;
    index++
  ) {
    const originalExercise =
      originalExercises[
        index
      ];

    const newExerciseId =
      nextExerciseId;

    nextExerciseId += 1;

    const newExercise:
      StoredExercise = {
      ...originalExercise,
      id: newExerciseId,
      exerciseTemplateId:
        newExerciseId,
      workoutTemplateId:
        newWorkoutId,
      sequenceNumber:
        index,
    };

    newWorkoutExercises.push(
      newExercise
    );
  }

  const currentWorkouts =
    workoutsStore[
      String(
        result.weekId
      )
    ] || [];

  const newWorkout:
    StoredWorkout = {
    ...result.workout,
    id: newWorkoutId,
    workoutTemplateId:
      newWorkoutId,
    name: `${
      result.workout.name ||
      "Workout"
    } (Copy)`,
    weekTemplateId:
      result.weekId,
    sequenceNumber:
      currentWorkouts.length,
  };

  workoutsStore[
    String(result.weekId)
  ] = [
    ...currentWorkouts,
    newWorkout,
  ];

  exercisesStore[
    String(newWorkoutId)
  ] = newWorkoutExercises;

  saveWorkoutsStore(
    workoutsStore
  );

  saveExercisesStore(
    exercisesStore
  );

  return HttpResponse.json(
    {
      data: {
        workoutTemplateId:
          newWorkoutId,
      },
    },
    {
      status: 200,
    }
  );
};

/* -------------------------------------------------------------------------- */
/* DELETE WORKOUT                                                             */
/* -------------------------------------------------------------------------- */

const deleteWorkoutResolver = ({
  params,
}: {
  params: {
    workoutId?: string;
  };
}) => {
  const workoutId =
    Number(
      params.workoutId
    );

  if (
    !Number.isFinite(
      workoutId
    )
  ) {
    return HttpResponse.json(
      {
        message:
          "Workout template not found.",
      },
      {
        status: 404,
      }
    );
  }

  const workoutsStore =
    getWorkoutsStore();

  let foundWorkout = false;

  for (const key of Object.keys(
    workoutsStore
  )) {
    const workouts =
      workoutsStore[key] ||
      [];

    const filteredWorkouts =
      workouts.filter(
        (workout) => {
          const matches =
            Number(
              workout.id
            ) ===
              workoutId ||
            Number(
              workout.workoutTemplateId
            ) ===
              workoutId;

          if (matches) {
            foundWorkout =
              true;
          }

          return !matches;
        }
      );

    workoutsStore[key] =
      filteredWorkouts;
  }

  /*
   * Remove the workout from any
   * nested week representation too.
   */
  const weeksStore =
    getWeeksStore();

  for (const planId of Object.keys(
    weeksStore
  )) {
    const weeks =
      weeksStore[planId] ||
      [];

    for (const week of weeks) {
      if (
        !Array.isArray(
          week.workouts
        )
      ) {
        continue;
      }

      const originalLength =
        week.workouts.length;

      week.workouts =
        week.workouts.filter(
          (workout) =>
            Number(
              workout.id
            ) !==
              workoutId &&
            Number(
              workout.workoutTemplateId
            ) !==
              workoutId
        );

      if (
        week.workouts.length !==
        originalLength
      ) {
        foundWorkout =
          true;
      }
    }
  }

  if (!foundWorkout) {
    return HttpResponse.json(
      {
        message:
          "Workout template not found.",
        workoutId,
      },
      {
        status: 404,
      }
    );
  }

  const exercisesStore =
    getExercisesStore();

  /*
   * Remove exercises stored
   * directly under the workout ID.
   */
  delete exercisesStore[
    String(workoutId)
  ];

  /*
   * Also remove exercises that
   * reference this workout.
   */
  for (const key of Object.keys(
    exercisesStore
  )) {
    const exercises =
      exercisesStore[key] ||
      [];

    const remainingExercises =
      exercises.filter(
        (exercise) =>
          Number(
            exercise.workoutTemplateId
          ) !==
          workoutId
      );

    if (
      remainingExercises.length ===
      0
    ) {
      delete exercisesStore[
        key
      ];
    } else {
      exercisesStore[key] =
        remainingExercises;
    }
  }

  saveWorkoutsStore(
    workoutsStore
  );

  saveWeeksStore(
    weeksStore
  );

  saveExercisesStore(
    exercisesStore
  );

  return HttpResponse.json(
    {
      message:
        "Workout template deleted successfully.",
    },
    {
      status: 200,
    }
  );
};

/* -------------------------------------------------------------------------- */
/* GET EXERCISE LIBRARY                                                       */
/* -------------------------------------------------------------------------- */

const getExercisesResolver = ({
  request,
}: {
  request: Request;
}) => {
  const url =
    new URL(request.url);

  const page =
    Number(
      url.searchParams.get(
        "page"
      ) || "1"
    );

  const limit =
    Number(
      url.searchParams.get(
        "limit"
      ) || "50"
    );

  const start =
    (page - 1) *
    limit;

  const end =
    start + limit;

  const exercises =
    exercisesData.slice(
      start,
      end
    );

  return HttpResponse.json(
    {
      data: exercises,
      total:
        exercisesData.length,
      page,
      limit,
    },
    {
      status: 200,
    }
  );
};

/* -------------------------------------------------------------------------- */
/* ADD EXERCISE                                                               */
/* -------------------------------------------------------------------------- */

const addExerciseResolver =
  async ({
    request,
  }: {
    request: Request;
  }) => {
    const body =
      (await request.json()) as {
        exerciseId: number;
        workoutTemplateId: number;
        sequenceNumber: number;
        defaultReps: string;
        defaultSets: number;
        defaultRestTimeSeconds: number;
        durationMinutes: number;
        defaultWeight: number;
      };

    const libraryExercise =
      (
        exercisesData as Array<{
          id: number;
          [key: string]: unknown;
        }>
      ).find(
        (item) =>
          Number(item.id) ===
          Number(body.exerciseId)
      );

    if (!libraryExercise) {
      return HttpResponse.json(
        {
          message:
            "Exercise not found.",
        },
        {
          status: 404,
        }
      );
    }

    const exercisesStore =
      getExercisesStore();

    const allExercises =
      Object.values(
        exercisesStore
      ).flat();

    const exerciseTemplateId =
      getNextId(
        allExercises
      );

    const newExercise:
      StoredExercise = {
      id: exerciseTemplateId,
      exerciseId:
        Number(
          body.exerciseId
        ),
      workoutTemplateId:
        Number(
          body.workoutTemplateId
        ),
      sequenceNumber:
        Number(
          body.sequenceNumber
        ),
      defaultReps:
        String(
          body.defaultReps
        ),
      defaultSets:
        Number(
          body.defaultSets
        ),
      defaultRestTimeSeconds:
        Number(
          body.defaultRestTimeSeconds
        ),
      defaultDurationMinutes:
        Number(
          body.durationMinutes
        ),
      defaultWeight:
        Number(
          body.defaultWeight
        ),
    };

    const workoutKey =
      String(
        body.workoutTemplateId
      );

    exercisesStore[
      workoutKey
    ] = [
      ...(exercisesStore[
        workoutKey
      ] || []),
      newExercise,
    ];

    saveExercisesStore(
      exercisesStore
    );

    /*
     * Match the real API:
     * the create/attach endpoint returns only
     * a success message, not the created object.
     */
    return HttpResponse.json(
      {
        message:
          "Exercise added to workout template.",
      },
      {
        status: 201,
      }
    );
  };

/* -------------------------------------------------------------------------- */
/* UPDATE EXERCISE                                                            */
/* -------------------------------------------------------------------------- */

const updateExerciseResolver =
  async ({
    params,
    request,
  }: {
    params: {
      exerciseTemplateId?: string;
    };
    request: Request;
  }) => {
    const exerciseTemplateId =
      Number(
        params.exerciseTemplateId
      );

    if (
      !Number.isFinite(
        exerciseTemplateId
      )
    ) {
      return HttpResponse.json(
        {
          message:
            "Exercise template not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      (await request.json()) as {
        sequenceNumber?: number;
        defaultReps?: string;
        defaultSets?: number;
        defaultRestTimeSeconds?: number;
        durationMinutes?: number;
        defaultWeight?: number;
      };

    const exercisesStore =
      getExercisesStore();

    let updatedExercise:
      | StoredExercise
      | null = null;

    for (const exercises of Object.values(
      exercisesStore
    )) {
      const exercise =
        exercises.find(
          (item) =>
            Number(
              item.id
            ) ===
            exerciseTemplateId
        );

      if (!exercise) {
        continue;
      }

      if (
        body.sequenceNumber !==
        undefined
      ) {
        exercise.sequenceNumber =
          Number(
            body.sequenceNumber
          );
      }

      if (
        body.defaultReps !==
        undefined
      ) {
        exercise.defaultReps =
          String(
            body.defaultReps
          );
      }

      if (
        body.defaultSets !==
        undefined
      ) {
        exercise.defaultSets =
          Number(
            body.defaultSets
          );
      }

      if (
        body.defaultRestTimeSeconds !==
        undefined
      ) {
        exercise.defaultRestTimeSeconds =
          Number(
            body.defaultRestTimeSeconds
          );
      }

      if (
        body.durationMinutes !==
        undefined
      ) {
        exercise.defaultDurationMinutes =
          Number(
            body.durationMinutes
          );
      }

      if (
        body.defaultWeight !==
        undefined
      ) {
        exercise.defaultWeight =
          Number(
            body.defaultWeight
          );
      }

      updatedExercise =
        exercise;

      break;
    }

    if (!updatedExercise) {
      return HttpResponse.json(
        {
          message:
            "Exercise template not found.",
        },
        {
          status: 404,
        }
      );
    }

    saveExercisesStore(
      exercisesStore
    );

    /*
     * Match the documented API: update returns
     * a success message rather than the resource.
     */
    return HttpResponse.json(
      {
        message:
          "Exercise template updated successfully.",
      },
      {
        status: 200,
      }
    );
  };

/* -------------------------------------------------------------------------- */
/* DELETE EXERCISE                                                            */
/* -------------------------------------------------------------------------- */

const deleteExerciseResolver = ({
  params,
}: {
  params: {
    exerciseTemplateId?: string;
  };
}) => {
  const exerciseTemplateId =
    Number(
      params.exerciseTemplateId
    );

  if (
    !Number.isFinite(
      exerciseTemplateId
    )
  ) {
    return HttpResponse.json(
      {
        message:
          "Exercise template not found.",
      },
      {
        status: 404,
      }
    );
  }

  const exercisesStore =
    getExercisesStore();

  let deletedExercise:
    | StoredExercise
    | null = null;

  for (const exercises of Object.values(
    exercisesStore
  )) {
    const exerciseIndex =
      exercises.findIndex(
        (item) =>
          Number(
            item.id
          ) ===
          exerciseTemplateId
      );

    if (
      exerciseIndex === -1
    ) {
      continue;
    }

    deletedExercise =
      exercises[
        exerciseIndex
      ];

    exercises.splice(
      exerciseIndex,
      1
    );

    break;
  }

  if (!deletedExercise) {
    return HttpResponse.json(
      {
        message:
          "Exercise template not found.",
      },
      {
        status: 404,
      }
    );
  }

  saveExercisesStore(
    exercisesStore
  );

  return HttpResponse.json(
    {
      message:
        "Exercise removed from workout successfully.",
    },
    {
      status: 200,
    }
  );
};

/* -------------------------------------------------------------------------- */
/* REORDER EXERCISES                                                          */
/* -------------------------------------------------------------------------- */

const reorderExercisesResolver =
  async ({
    params,
    request,
  }: {
    params: {
      workoutId?: string;
    };
    request: Request;
  }) => {
    const workoutId =
      Number(
        params.workoutId
      );

    if (
      !Number.isFinite(
        workoutId
      )
    ) {
      return HttpResponse.json(
        {
          message:
            "Workout template not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      (await request.json()) as {
        exercises?: Array<{
          id: number;
          sequenceNumber: number;
        }>;
      };

    const ordered =
      body.exercises ?? [];

    const exercisesStore =
      getExercisesStore();

    const workoutExercises =
      getWorkoutExercisesFromStore(
        {
          id: workoutId,
        } as StoredWorkout,
        exercisesStore
      );

    if (
      workoutExercises.length ===
      0
    ) {
      return HttpResponse.json(
        {
          message:
            "No exercises found for workout template.",
        },
        {
          status: 404,
        }
      );
    }

    const sequenceById =
      new Map(
        ordered.map(
          (item) => [
            Number(item.id),
            Number(
              item.sequenceNumber
            ),
          ]
        )
      );

    for (const exercise of
      workoutExercises) {
      const sequence =
        sequenceById.get(
          Number(exercise.id)
        );

      if (
        sequence !==
        undefined
      ) {
        exercise.sequenceNumber =
          sequence;
      }
    }

    const reordered =
      [...workoutExercises].sort(
        (a, b) =>
          Number(
            a.sequenceNumber
          ) -
          Number(
            b.sequenceNumber
          )
      );

    exercisesStore[
      String(workoutId)
    ] = reordered;

    saveExercisesStore(
      exercisesStore
    );

    return HttpResponse.json(
      {
        message:
          "Workout exercises reordered successfully.",
      },
      {
        status: 200,
      }
    );
  };

/* -------------------------------------------------------------------------- */
/* GET WORKOUT LOGS                                                           */
/* -------------------------------------------------------------------------- */

const getWorkoutLogsResolver = ({
  request,
}: {
  request: Request;
}) => {
  const url =
    new URL(request.url);

  const traineeIdParam =
    url.searchParams.get(
      "traineeId"
    );

  const status =
    url.searchParams.get(
      "status"
    );

  const pageNumberRaw =
    Number(
      url.searchParams.get(
        "pageNumber"
      ) || "1"
    );

  const pageSizeRaw =
    Number(
      url.searchParams.get(
        "pageSize"
      ) || "10"
    );

  const pageNumber =
    Number.isFinite(
      pageNumberRaw
    ) &&
    pageNumberRaw > 0
      ? Math.floor(
          pageNumberRaw
        )
      : 1;

  const pageSize =
    Number.isFinite(
      pageSizeRaw
    ) &&
    pageSizeRaw > 0
      ? Math.floor(
          pageSizeRaw
        )
      : 10;

  const sortBy =
    url.searchParams.get(
      "sortBy"
    ) || "createdAt";

  const sortOrder =
    url.searchParams.get(
      "sortOrder"
    ) || "desc";

  const traineeId =
    traineeIdParam !== null
      ? Number(
          traineeIdParam
        )
      : null;

  const assignments =
    getAssignments();

  /*
   * Only generate logs for assignments
   * belonging to the requested trainee.
   */
  const traineeAssignments =
    assignments.filter(
      (assignment) => {
        if (
          traineeId === null
        ) {
          return true;
        }

        if (
          !Number.isFinite(
            traineeId
          )
        ) {
          return false;
        }

        return (
          Number(
            assignment.traineeId
          ) ===
          traineeId
        );
      }
    );

  const allLogs: WorkoutLog[] =
    [];

  for (const assignment of
    traineeAssignments) {
    allLogs.push(
      ...createMockLogsForAssignment(
        assignment
      )
    );
  }

  /*
   * Filter by status.
   */
  const filteredLogs =
    status
      ? allLogs.filter(
          (log) =>
            log.status ===
            status
        )
      : allLogs;

  /*
   * Sort logs.
   *
   * The API documentation lists
   * totalAmount as a possible value,
   * although workout logs do not
   * contain that field. createdAt
   * remains the meaningful sort field
   * for this resource.
   */
  const sortedLogs = [
    ...filteredLogs,
  ].sort((a, b) => {
    if (
      sortBy ===
      "createdAt"
    ) {
      const aValue =
        new Date(
          a.createdAt
        ).getTime();

      const bValue =
        new Date(
          b.createdAt
        ).getTime();

      return sortOrder ===
        "asc"
        ? aValue - bValue
        : bValue - aValue;
    }

    return 0;
  });

  /*
   * Pagination.
   */
  const total =
    sortedLogs.length;

  const totalPages =
    Math.ceil(
      total / pageSize
    );

  const start =
    (pageNumber - 1) *
    pageSize;

  const end =
    start + pageSize;

  const paginatedLogs =
    sortedLogs.slice(
      start,
      end
    );

  return HttpResponse.json(
    {
      data: paginatedLogs,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages,
      },
    },
    {
      status: 200,
    }
  );
};

/* -------------------------------------------------------------------------- */
/* GET WORKOUT LOG DETAIL                                                     */
/* -------------------------------------------------------------------------- */

const getWorkoutLogDetailResolver = ({
  params,
  request,
}: {
  params: {
    workoutLogId?: string;
  };
  request: Request;
}) => {
  const workoutLogId =
    Number(
      params.workoutLogId
    );

  if (
    !Number.isFinite(
      workoutLogId
    )
  ) {
    return HttpResponse.json(
      {
        message:
          "Workout log not found.",
      },
      {
        status: 404,
      }
    );
  }

  const log =
    mockWorkoutLogs.get(
      workoutLogId
    );

  if (!log) {
    return HttpResponse.json(
      {
        message:
          "Workout log not found.",
      },
      {
        status: 404,
      }
    );
  }

  /*
   * The real API accepts traineeId
   * as an optional query parameter.
   */
  const url =
    new URL(request.url);

  const traineeIdParam =
    url.searchParams.get(
      "traineeId"
    );

  if (
    traineeIdParam !== null &&
    Number(
      traineeIdParam
    ) !==
      Number(
        log.traineeUserId
      )
  ) {
    return HttpResponse.json(
      {
        message:
          "Workout log not found.",
      },
      {
        status: 404,
      }
    );
  }

  const workoutsStore =
    getWorkoutsStore();

  const exercisesStore =
    getExercisesStore();

  const workout =
    Object.values(
      workoutsStore
    )
      .flat()
      .find(
        (item) =>
          Number(item.id) ===
            Number(
              log.workoutTemplateId
            ) ||
          Number(
            item.workoutTemplateId
          ) ===
            Number(
              log.workoutTemplateId
            )
      );

  if (!workout) {
    return HttpResponse.json(
      {
        message:
          "Workout template not found.",
      },
      {
        status: 404,
      }
    );
  }

  const exercises =
    getWorkoutExercises(
      workout,
      exercisesStore
    );

  const exerciseLibrary =
    exercisesData as Array<{
      id: number;
      name?: string;
      [key: string]: unknown;
    }>;

  const exerciseLogs =
    exercises.map(
      (
        exercise,
        exerciseIndex
      ) => {
        const exerciseId =
          Number(
            exercise.exerciseId ??
              exercise.id
          );

        const libraryExercise =
          exerciseLibrary.find(
            (item) =>
              Number(
                item.id
              ) ===
              exerciseId
          );

        const exerciseName =
          typeof libraryExercise?.name ===
          "string"
            ? libraryExercise.name
            : `Exercise ${exerciseId}`;

        const expectedSets =
          Number(
            exercise.defaultSets
          ) > 0
            ? Number(
                exercise.defaultSets
              )
            : 3;

        const expectedReps =
          typeof exercise.defaultReps ===
          "string"
            ? exercise.defaultReps
            : String(
                exercise.defaultReps ??
                  "10"
              );

        const expectedWeight =
          Number(
            exercise.defaultWeight
          ) >= 0
            ? Number(
                exercise.defaultWeight
              )
            : 0;

        const expectedRestTimeSeconds =
          Number(
            exercise.defaultRestTimeSeconds
          ) >= 0
            ? Number(
                exercise.defaultRestTimeSeconds
              )
            : 60;

        const durationMinutes =
          Number(
            exercise.defaultDurationMinutes
          ) > 0
            ? Number(
                exercise.defaultDurationMinutes
              )
            : 5;

        const durationSeconds =
          durationMinutes * 60;

        /*
         * Convert configured reps into
         * a number for the mock set logs.
         *
         * Examples:
         * "10"      -> 10
         * "8-12"    -> 8
         * "10 reps" -> 10
         */
        let reps = 10;

        if (
          typeof exercise.defaultReps ===
            "number" &&
          Number.isFinite(
            exercise.defaultReps
          )
        ) {
          reps =
            exercise.defaultReps;
        } else if (
          typeof exercise.defaultReps ===
          "string"
        ) {
          const firstNumber =
            Number(
              exercise.defaultReps.match(
                /\d+/
              )?.[0]
            );

          if (
            Number.isFinite(
              firstNumber
            )
          ) {
            reps =
              firstNumber;
          }
        }

        const exerciseLogId =
          Date.now() +
          exerciseIndex *
            1000;

        const setLogs =
          Array.from(
            {
              length:
                expectedSets,
            },
            (
              _,
              setIndex
            ) => {
              /*
               * Slightly vary the performed
               * reps so the mock looks like
               * actual trainee activity.
               */
              const performedReps =
                reps -
                ((exerciseIndex +
                  setIndex) %
                  3 ===
                0
                  ? 2
                  : 0);

              return {
                id:
                  exerciseLogId +
                  setIndex +
                  1,
                exerciseLogId,
                reps:
                  Math.max(
                    0,
                    performedReps
                  ),
                weight:
                  expectedWeight,
                durationSeconds:
                  Math.round(
                    durationSeconds /
                      expectedSets
                  ),
                restTimeSeconds:
                  expectedRestTimeSeconds,
                sequenceNumber:
                  setIndex + 1,
              };
            }
          );

        return {
          id: exerciseLogId,
          exerciseName,
          workoutExerciseTemplateId:
            Number(
              exercise.id
            ),
          expectedSets,
          expectedReps,
          expectedWeight,
          expectedRestTimeSeconds,
          setLogs,
          durationSeconds,
          sequenceNumber:
            exerciseIndex + 1,
        };
      }
    );

  /*
   * Calculate the workout duration
   * from the generated timer data.
   */
  const durationMinutes =
    Math.max(
      0,
      Math.round(
        (
          new Date(
            log.endedAt
          ).getTime() -
          new Date(
            log.startedAt
          ).getTime()
        ) /
          (60 * 1000)
      )
    );

  const detail:
    WorkoutLogDetail = {
    id: log.id,
    planAssignmentId:
      log.planAssignmentId,
    workoutTemplateId:
      log.workoutTemplateId,
    durationMinutes,
    status: log.status,
    notes: log.notes,
    exerciseLogs,
  };

  return HttpResponse.json(
    {
      data: detail,
    },
    {
      status: 200,
    }
  );
};

/* -------------------------------------------------------------------------- */
/* HANDLERS                                                                   */
/* -------------------------------------------------------------------------- */

export const workoutHandlers = [
  /* ------------------------------------------------------------------------ */
  /* Workout Templates                                                        */
  /* ------------------------------------------------------------------------ */

  http.post(
    "/api/plans/templates/workouts",
    createWorkoutResolver
  ),

  http.post(
    "*/api/plans/templates/workouts",
    createWorkoutResolver
  ),

  http.put(
    "/api/plans/templates/workouts/:workoutId",
    updateWorkoutResolver
  ),

  http.put(
    "*/api/plans/templates/workouts/:workoutId",
    updateWorkoutResolver
  ),

  http.get(
    "/api/plans/templates/workouts/:workoutId",
    getWorkoutDetailResolver
  ),

  http.get(
    "*/api/plans/templates/workouts/:workoutId",
    getWorkoutDetailResolver
  ),

  http.post(
    "/api/plans/templates/workouts/:workoutId/duplicate",
    duplicateWorkoutResolver
  ),

  http.post(
    "*/api/plans/templates/workouts/:workoutId/duplicate",
    duplicateWorkoutResolver
  ),

  http.delete(
    "/api/plans/templates/workouts/:workoutId",
    deleteWorkoutResolver
  ),

  http.delete(
    "*/api/plans/templates/workouts/:workoutId",
    deleteWorkoutResolver
  ),

  /* ------------------------------------------------------------------------ */
  /* Exercise Library                                                         */
  /* ------------------------------------------------------------------------ */

  http.get(
    "/api/exercises",
    getExercisesResolver
  ),

  http.get(
    "*/api/exercises",
    getExercisesResolver
  ),

  /* ------------------------------------------------------------------------ */
  /* Workout Exercises                                                        */
  /* ------------------------------------------------------------------------ */

  http.post(
    "/api/plans/templates/exercises",
    addExerciseResolver
  ),

  http.post(
    "*/api/plans/templates/exercises",
    addExerciseResolver
  ),

  http.put(
    "/api/plans/templates/exercises/:exerciseTemplateId",
    updateExerciseResolver
  ),

  http.put(
    "*/api/plans/templates/exercises/:exerciseTemplateId",
    updateExerciseResolver
  ),

  http.delete(
    "/api/plans/templates/exercises/:exerciseTemplateId",
    deleteExerciseResolver
  ),

  http.delete(
    "*/api/plans/templates/exercises/:exerciseTemplateId",
    deleteExerciseResolver
  ),

  http.put(
    "/api/plans/templates/workouts/:workoutId/exercises/reorder",
    reorderExercisesResolver
  ),

  http.put(
    "*/api/plans/templates/workouts/:workoutId/exercises/reorder",
    reorderExercisesResolver
  ),

  /* ------------------------------------------------------------------------ */
  /* Workout Logs                                                             */
  /* ------------------------------------------------------------------------ */

  http.get(
    "/api/logs/workouts",
    getWorkoutLogsResolver
  ),

  http.get(
    "*/api/logs/workouts",
    getWorkoutLogsResolver
  ),

  http.get(
    "/api/logs/workouts/:workoutLogId",
    getWorkoutLogDetailResolver
  ),

  http.get(
    "*/api/logs/workouts/:workoutLogId",
    getWorkoutLogDetailResolver
  ),
];