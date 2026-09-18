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
  traineeId: number;
  planAssignmentId?: number;
  workoutTemplateId?: number;
  [key: string]: unknown;
}

interface WorkoutLogDetail
  extends WorkoutLog {
  exercises?: unknown[];
}

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
  ] of Object.entries(workoutsStore)) {
    const workout = workouts.find(
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

function createMockLogsForAssignment(
  assignment: PlanAssignment
): WorkoutLog[] {
  const workoutsStore =
    getWorkoutsStore();

  const logs: WorkoutLog[] =
    [];

  let logId = Date.now();

  for (const workouts of Object.values(
    workoutsStore
  )) {
    for (const workout of workouts) {
      logs.push({
        id: logId++,
        traineeId:
          assignment.traineeId,
        planAssignmentId:
          assignment.id,
        workoutTemplateId:
          Number(workout.id),
        completed: false,
      });
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
          number | string;
      };

    const workoutsStore =
      getWorkoutsStore();

    const allWorkouts =
      Object.values(
        workoutsStore
      ).flat();

    const newWorkoutId =
      getNextId(allWorkouts);

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
      ...(workoutsStore[weekKey] ||
        []),
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
      Number(params.workoutId);

    if (!Number.isFinite(workoutId)) {
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
        body.name !== undefined
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
    Number(params.workoutId);

  if (!Number.isFinite(workoutId)) {
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
    findWorkout(workoutId);

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
        exercises,
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

  if (directExercises.length > 0) {
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
        Number(workout.id)
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
    Number(params.workoutId);

  if (!Number.isFinite(workoutId)) {
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
    findWorkout(workoutId);

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
    getNextId(allWorkouts);

  let nextExerciseId =
    getNextId(allExercises);

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
      originalExercises[index];

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
      String(result.weekId)
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
    Number(params.workoutId);

  if (!Number.isFinite(workoutId)) {
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
      workoutsStore[key] || [];

    const filteredWorkouts =
      workouts.filter(
        (workout) => {
          const matches =
            Number(workout.id) ===
              workoutId ||
            Number(
              workout.workoutTemplateId
            ) === workoutId;

          if (matches) {
            foundWorkout = true;
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
      weeksStore[planId] || [];

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
            Number(workout.id) !==
              workoutId &&
            Number(
              workout.workoutTemplateId
            ) !== workoutId
        );

      if (
        week.workouts.length !==
        originalLength
      ) {
        foundWorkout = true;
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
      exercisesStore[key] || [];

    const remainingExercises =
      exercises.filter(
        (exercise) =>
          Number(
            exercise.workoutTemplateId
          ) !== workoutId
      );

    if (
      remainingExercises.length ===
      0
    ) {
      delete exercisesStore[key];
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
    (page - 1) * limit;

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
        defaultDurationMinutes: number;
        defaultWeight: number;
      };

    const exercisesStore =
      getExercisesStore();

    const allExercises =
      Object.values(
        exercisesStore
      ).flat();

    const exerciseTemplateId =
      getNextId(allExercises);

    const newExercise:
      StoredExercise = {
      id: exerciseTemplateId,
      exerciseId:
        body.exerciseId,
      workoutTemplateId:
        body.workoutTemplateId,
      sequenceNumber:
        body.sequenceNumber,
      defaultReps:
        body.defaultReps,
      defaultSets:
        body.defaultSets,
      defaultRestTimeSeconds:
        body.defaultRestTimeSeconds,
      defaultDurationMinutes:
        body.defaultDurationMinutes,
      defaultWeight:
        body.defaultWeight,
    };

    const workoutKey =
      String(
        body.workoutTemplateId
      );

    exercisesStore[workoutKey] = [
      ...(exercisesStore[
        workoutKey
      ] || []),
      newExercise,
    ];

    saveExercisesStore(
      exercisesStore
    );

    return HttpResponse.json(
      {
        data: newExercise,
      },
      {
        status: 200,
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
      (await request.json()) as Partial<
        StoredExercise
      >;

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
            Number(item.id) ===
            exerciseTemplateId
        );

      if (!exercise) {
        continue;
      }

      Object.assign(
        exercise,
        body
      );

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

    return HttpResponse.json(
      {
        data: updatedExercise,
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
          Number(item.id) ===
          exerciseTemplateId
      );

    if (
      exerciseIndex === -1
    ) {
      continue;
    }

    deletedExercise =
      exercises[exerciseIndex];

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
      Number(params.workoutId);

    if (!Number.isFinite(workoutId)) {
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
        exercises: StoredExercise[];
      };

    const exercisesStore =
      getExercisesStore();

    exercisesStore[
      String(workoutId)
    ] = body.exercises;

    saveExercisesStore(
      exercisesStore
    );

    return HttpResponse.json(
      {
        data:
          body.exercises,
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

  const traineeId =
    Number(
      url.searchParams.get(
        "traineeId"
      )
    );

  const assignments =
    getAssignments();

  const traineeAssignments =
    assignments.filter(
      (assignment) =>
        Number(
          assignment.traineeId
        ) === traineeId
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

  return HttpResponse.json(
    {
      data: allLogs,
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
}: {
  params: {
    workoutLogId?: string;
  };
}) => {
  const workoutLogId =
    Number(
      params.workoutLogId
    );

  const detail:
    WorkoutLogDetail = {
    id: workoutLogId,
    traineeId: 1,
    completed: false,
    exercises: [],
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