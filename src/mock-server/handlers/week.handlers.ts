import {
  http,
  HttpResponse,
} from "msw";

import {
  findTemplateForTrainer,
  getNextId,
  getTemplateWeeks,
  getWeeksStore,
  getWeekWorkouts,
  getWorkoutsStore,
  getExercisesStore,
  saveWeeksStore,
  saveWorkoutsStore,
  saveExercisesStore,
} from "../utils/templateHelpers";
import {
  StoredWeek,
  StoredWorkout,
} from "../types/program.types";

import {
  getTrainerIdFromRequest,
} from "../utils/mockAuth";

/* -------------------------------------------------------------------------- */
/* RESPONSE HELPERS                                                           */
/* -------------------------------------------------------------------------- */

function unauthorizedResponse() {
  return HttpResponse.json(
    {
      message:
        "Unauthorized access token",
    },
    {
      status: 401,
    }
  );
}

function notFoundResponse(
  message: string
) {
  return HttpResponse.json(
    {
      message,
    },
    {
      status: 404,
    }
  );
}

/* -------------------------------------------------------------------------- */
/* FIND WEEK                                                                  */
/* -------------------------------------------------------------------------- */

function findWeek(
  weekId: number
): {
  week: StoredWeek;
  templateId: number;
} | null {
  const weeksStore =
    getWeeksStore();

  for (const [
    templateKey,
    weeks,
  ] of Object.entries(weeksStore)) {
    const week = weeks.find(
      (item) =>
        Number(item.id) ===
        weekId
    );

    if (week) {
      return {
        week,
        templateId:
          Number(
            week.planTemplateId
          ) ||
          Number(templateKey),
      };
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* CREATE WEEK                                                                */
/* -------------------------------------------------------------------------- */

const createWeekResolver = async ({
  request,
}: {
  request: Request;
}) => {
  const trainerId =
    getTrainerIdFromRequest(request);

  if (trainerId === null) {
    return unauthorizedResponse();
  }

  const body =
    (await request.json()) as {
      sequenceNumber?: number;
      planTemplateId?: number;
    };

  const planTemplateId =
    Number(body.planTemplateId);

  if (
    !Number.isFinite(
      planTemplateId
    )
  ) {
    return HttpResponse.json(
      {
        message:
          "planTemplateId is required.",
      },
      {
        status: 400,
      }
    );
  }

  const template =
    findTemplateForTrainer(
      planTemplateId,
      trainerId
    );

  if (!template) {
    return notFoundResponse(
      "Template not found."
    );
  }

  const weeksStore =
    getWeeksStore();

  const currentWeeks =
    getTemplateWeeks(
      template,
      weeksStore
    );

  const allWeeks =
    Object.values(
      weeksStore
    ).flat();

  const newWeekId =
    getNextId(allWeeks);

  const sequenceNumber =
    typeof body.sequenceNumber ===
    "number"
      ? body.sequenceNumber
      : currentWeeks.length;

  const newWeek: StoredWeek = {
    id: newWeekId,
    weekId: newWeekId,
    planTemplateId:
      Number(template.id),
    sequenceNumber,
    workouts: [],
  };

  const templateKey =
    String(template.id);

  weeksStore[templateKey] = [
    ...(weeksStore[templateKey] ||
      []),
    newWeek,
  ];

  saveWeeksStore(
    weeksStore
  );

  return HttpResponse.json(
    {
      data: newWeek,
      message:
        "Week created successfully.",
    },
    {
      status: 201,
    }
  );
};

/* -------------------------------------------------------------------------- */
/* GET WEEK DETAIL                                                            */
/* -------------------------------------------------------------------------- */

const getWeekDetailResolver = ({
  request,
  params,
}: {
  request: Request;
  params: {
    weekId?: string;
  };
}) => {
  const trainerId =
    getTrainerIdFromRequest(request);

  if (trainerId === null) {
    return unauthorizedResponse();
  }

  const weekId =
    Number(params.weekId);

  if (!Number.isFinite(weekId)) {
    return notFoundResponse(
      "Week not found."
    );
  }

  const result =
    findWeek(weekId);

  if (!result) {
    return notFoundResponse(
      "Week not found."
    );
  }

  const template =
    findTemplateForTrainer(
      result.templateId,
      trainerId
    );

  if (!template) {
    return notFoundResponse(
      "Week not found."
    );
  }

  const workoutsStore =
    getWorkoutsStore();

  const workouts =
    getWeekWorkouts(
      result.week,
      workoutsStore
    );

  return HttpResponse.json({
    data: {
      ...result.week,
      workouts,
    },
  });
};

/* -------------------------------------------------------------------------- */
/* DUPLICATE WEEK                                                             */
/* -------------------------------------------------------------------------- */

const duplicateWeekResolver = ({
  request,
  params,
}: {
  request: Request;
  params: {
    weekId?: string;
  };
}) => {
  const trainerId =
    getTrainerIdFromRequest(request);

  if (trainerId === null) {
    return unauthorizedResponse();
  }

  const weekId =
    Number(params.weekId);

  if (!Number.isFinite(weekId)) {
    return notFoundResponse(
      "Week not found."
    );
  }

  const result =
    findWeek(weekId);

  if (!result) {
    return notFoundResponse(
      "Week not found."
    );
  }

  const template =
    findTemplateForTrainer(
      result.templateId,
      trainerId
    );

  if (!template) {
    return notFoundResponse(
      "Week not found."
    );
  }

  const weeksStore =
    getWeeksStore();

  const workoutsStore =
    getWorkoutsStore();

  const exercisesStore =
    getExercisesStore();

  const allWeeks =
    Object.values(
      weeksStore
    ).flat();

  const newWeekId =
    getNextId(allWeeks);

  const originalWorkouts =
    getWeekWorkouts(
      result.week,
      workoutsStore
    );

  const allWorkouts =
    Object.values(
      workoutsStore
    ).flat();

  const allExercises =
    Object.values(
      exercisesStore
    ).flat();

  const newWorkouts:
    StoredWorkout[] = [];

  for (
    let index = 0;
    index <
    originalWorkouts.length;
    index++
  ) {
    const originalWorkout =
      originalWorkouts[index];

    const newWorkoutId =
      getNextId(
        allWorkouts
      );

    const originalExercises =
      exercisesStore[
        String(
          originalWorkout.id
        )
      ] ||
      Object.values(
        exercisesStore
      )
        .flat()
        .filter(
          (exercise) =>
            Number(
              exercise.workoutTemplateId
            ) ===
            Number(
              originalWorkout.id
            )
        );

    const newExercises =
      originalExercises.map(
        (
          exercise,
          exerciseIndex
        ) => ({
          ...exercise,
          id:
            getNextId(
              allExercises
            ),
          exerciseTemplateId:
            getNextId(
              allExercises
            ),
          workoutTemplateId:
            newWorkoutId,
          sequenceNumber:
            exerciseIndex,
        })
      );

    exercisesStore[
      String(newWorkoutId)
    ] = newExercises;

    const newWorkout:
      StoredWorkout = {
      ...originalWorkout,
      id: newWorkoutId,
      workoutTemplateId:
        newWorkoutId,
      weekTemplateId:
        newWeekId,
      sequenceNumber:
        index,
    };

    newWorkouts.push(
      newWorkout
    );
  }

  const originalWeeks =
    getTemplateWeeks(
      template,
      weeksStore
    );

  const newWeek:
    StoredWeek = {
    ...result.week,
    id: newWeekId,
    weekId: newWeekId,
    planTemplateId:
      Number(template.id),
    sequenceNumber:
      originalWeeks.length,
    workouts: newWorkouts,
  };

  const templateKey =
    String(template.id);

  weeksStore[templateKey] = [
    ...(weeksStore[templateKey] ||
      []),
    newWeek,
  ];

  workoutsStore[
    String(newWeekId)
  ] = newWorkouts;

  saveWeeksStore(
    weeksStore
  );

  saveWorkoutsStore(
    workoutsStore
  );

  saveExercisesStore(
    exercisesStore
  );

  return HttpResponse.json(
    {
      data: newWeek,
      message:
        "Week duplicated successfully.",
    },
    {
      status: 201,
    }
  );
};

/* -------------------------------------------------------------------------- */
/* DELETE WEEK                                                                */
/* -------------------------------------------------------------------------- */

const deleteWeekResolver = ({
  request,
  params,
}: {
  request: Request;
  params: {
    weekId?: string;
  };
}) => {
  const trainerId =
    getTrainerIdFromRequest(request);

  if (trainerId === null) {
    return unauthorizedResponse();
  }

  const weekId =
    Number(params.weekId);

  if (!Number.isFinite(weekId)) {
    return notFoundResponse(
      "Week not found."
    );
  }

  const result =
    findWeek(weekId);

  if (!result) {
    return notFoundResponse(
      "Week not found."
    );
  }

  const template =
    findTemplateForTrainer(
      result.templateId,
      trainerId
    );

  if (!template) {
    return notFoundResponse(
      "Week not found."
    );
  }

  const weeksStore =
    getWeeksStore();

  const workoutsStore =
    getWorkoutsStore();

  const exercisesStore =
    getExercisesStore();

  const templateKey =
    String(template.id);

  const currentWeeks =
    weeksStore[templateKey] ||
    [];

  const updatedWeeks =
    currentWeeks
      .filter(
        (week) =>
          Number(week.id) !==
          weekId
      )
      .map(
        (week, index) => ({
          ...week,
          sequenceNumber:
            index,
        })
      );

  if (
    updatedWeeks.length ===
    currentWeeks.length
  ) {
    return notFoundResponse(
      "Week not found."
    );
  }

  const deletedWorkouts =
    getWeekWorkouts(
      result.week,
      workoutsStore
    );

  const deletedWorkoutIds =
    new Set(
      deletedWorkouts.map(
        (workout) =>
          Number(workout.id)
      )
    );

  /*
   * Remove exercises belonging
   * to deleted workouts.
   */
  for (const key of Object.keys(
    exercisesStore
  )) {
    const exercises =
      exercisesStore[key] || [];

    const remainingExercises =
      exercises.filter(
        (exercise) =>
          !deletedWorkoutIds.has(
            Number(
              exercise.workoutTemplateId
            )
          ) &&
          !deletedWorkoutIds.has(
            Number(key)
          )
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

  /*
   * Remove the workouts belonging
   * to the deleted week.
   */
  delete workoutsStore[
    String(weekId)
  ];

  for (const key of Object.keys(
    workoutsStore
  )) {
    const workouts =
      workoutsStore[key] || [];

    const remainingWorkouts =
      workouts.filter(
        (workout) =>
          Number(
            workout.weekTemplateId
          ) !== weekId
      );

    if (
      remainingWorkouts.length ===
      0
    ) {
      delete workoutsStore[key];
    } else {
      workoutsStore[key] =
        remainingWorkouts;
    }
  }

  weeksStore[templateKey] =
    updatedWeeks;

  saveWeeksStore(
    weeksStore
  );

  saveWorkoutsStore(
    workoutsStore
  );

  saveExercisesStore(
    exercisesStore
  );

  return HttpResponse.json({
    message:
      "Week deleted successfully.",
  });
};

/* -------------------------------------------------------------------------- */
/* HANDLERS                                                                   */
/* -------------------------------------------------------------------------- */

export const weekHandlers = [
  /* Create week */
  http.post(
    "/api/plans/templates/weeks",
    createWeekResolver
  ),

  http.post(
    "*/api/plans/templates/weeks",
    createWeekResolver
  ),

  /* Get week detail */
  http.get(
    "/api/plans/templates/weeks/:weekId",
    getWeekDetailResolver
  ),

  http.get(
    "*/api/plans/templates/weeks/:weekId",
    getWeekDetailResolver
  ),

  /* Duplicate week */
  http.post(
    "/api/plans/templates/weeks/:weekId/duplicate",
    duplicateWeekResolver
  ),

  http.post(
    "*/api/plans/templates/weeks/:weekId/duplicate",
    duplicateWeekResolver
  ),

  /* Delete week */
  http.delete(
    "/api/plans/templates/weeks/:weekId",
    deleteWeekResolver
  ),

  http.delete(
    "*/api/plans/templates/weeks/:weekId",
    deleteWeekResolver
  ),
];