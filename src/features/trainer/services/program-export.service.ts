import { programService } from "./program.service";

import {
  PrintableExercise,
  PrintableProgram,
  PrintableWeek,
  PrintableWorkout,
} from "../components/program-builder/ProgramPrintView";

interface RawExercise {
  id: number;
  exerciseId?: number;
  name?: string;

  sets?: Array<{
    setNumber?: number;
    reps?: number;
    weight?: number;
  }>;

  reps?: number | string;
  rest?: number;

  defaultSets?: number;
  defaultReps?: number | string;
  defaultRestTimeSeconds?: number;
  defaultWeight?: number;

  [key: string]: unknown;
}

interface RawWorkout {
  id: number;
  workoutTemplateId?: number;
  name?: string;
  sequenceNumber?: number;
  exercises?: RawExercise[];

  [key: string]: unknown;
}

interface RawWeek {
  id: number;
  sequenceNumber?: number;
  workouts?: RawWorkout[];

  [key: string]: unknown;
}

interface RawTemplate {
  id: number;
  name?: string;
  description?: string;
  status?: string;

  durationWeekTemplates?: number;
  durationWeeks?: number;

  weeks?: RawWeek[];

  [key: string]: unknown;
}

interface RawLibraryExercise {
  id: number;
  name: string;
}

function getResponseData<T>(
  response: {
    data?: unknown;
  }
): T {
  const outer = response?.data;

  if (
    outer &&
    typeof outer === "object" &&
    "data" in outer
  ) {
    const nested = (
      outer as {
        data?: unknown;
      }
    ).data;

    if (nested !== undefined) {
      return nested as T;
    }
  }

  return outer as T;
}

function getLibraryExercises(
  response: unknown
): RawLibraryExercise[] {
  if (
    !response ||
    typeof response !== "object"
  ) {
    return [];
  }

  const responseObject = response as {
    data?: unknown;
  };

  const outerData = responseObject.data;

  if (
    !outerData ||
    typeof outerData !== "object"
  ) {
    return [];
  }

  const dataObject = outerData as {
    data?: unknown;
    exercises?: unknown;
  };

  const data =
    dataObject.data ?? outerData;

  if (Array.isArray(data)) {
    return data as RawLibraryExercise[];
  }

  if (
    data &&
    typeof data === "object" &&
    "exercises" in data
  ) {
    const exercises = (
      data as {
        exercises?: unknown;
      }
    ).exercises;

    if (Array.isArray(exercises)) {
      return exercises as RawLibraryExercise[];
    }
  }

  return [];
}

function buildPrintableExercise(
  exercise: RawExercise,
  library: RawLibraryExercise[]
): PrintableExercise {
  const libraryExercise = library.find(
    (item) =>
      item.id ===
      Number(exercise.exerciseId)
  );

  const savedSets =
    Array.isArray(exercise.sets)
      ? exercise.sets
      : [];

  const sets =
    exercise.defaultSets ??
    (savedSets.length || 3);

  const reps =
    exercise.defaultReps ??
    exercise.reps ??
    savedSets[0]?.reps ??
    10;

  const weight =
    exercise.defaultWeight ??
    savedSets[0]?.weight ??
    0;

  const rest =
    exercise.defaultRestTimeSeconds ??
    exercise.rest ??
    60;

  return {
    id: Number(exercise.id),

    name:
      exercise.name ||
      libraryExercise?.name ||
      "Exercise",

    sets: Number(sets),

    reps: String(reps),

    weight: Number(weight),

    rest: Number(rest),
  };
}

export async function prepareProgramForExport(
  templateId: number
): Promise<PrintableProgram> {
  let templateResponse;
  let exercisesResponse;

  // ---------------------------------------------------------------------------
  // Template
  // ---------------------------------------------------------------------------

  try {
    templateResponse =
      await programService.getTemplateDetail(
        templateId
      );
  } catch (error) {
    console.error(
      "[PDF EXPORT] getTemplateDetail failed:",
      {
        templateId,
        error,
        response: (
          error as {
            response?: {
              status?: number;
              data?: unknown;
            };
          }
        )?.response,
      }
    );

    throw error;
  }

  // ---------------------------------------------------------------------------
  // Exercise Library
  //
  // programService.getExercises defaults to:
  // page = 1
  // limit = 50
  //
  // Do not request limit=1000 because the backend validates the
  // maximum page size and returns 422 for that request.
  // ---------------------------------------------------------------------------

  try {
    exercisesResponse =
      await programService.getExercises(1);
  } catch (error) {
    console.error(
      "[PDF EXPORT] getExercises failed:",
      {
        page: 1,
        limit: 50,
        error,
        response: (
          error as {
            response?: {
              status?: number;
              data?: unknown;
            };
          }
        )?.response,
      }
    );

    throw error;
  }

  const template =
    getResponseData<RawTemplate>(
      templateResponse
    );

  const library =
    getLibraryExercises(
      exercisesResponse
    );

  const rawWeeks =
    Array.isArray(template?.weeks)
      ? template.weeks
      : [];

  // ---------------------------------------------------------------------------
  // Weeks
  // ---------------------------------------------------------------------------

  const weekDetails =
    await Promise.all(
      rawWeeks.map(
        async (week) => {
          try {
            const response =
              await programService.getWeekDetail(
                Number(week.id)
              );

            return getResponseData<RawWeek>(
              response
            );
          } catch (error) {
            console.error(
              "[PDF EXPORT] getWeekDetail failed:",
              {
                weekId: week.id,
                error,
                response: (
                  error as {
                    response?: {
                      status?: number;
                      data?: unknown;
                    };
                  }
                )?.response,
              }
            );

            throw error;
          }
        }
      )
    );

  // ---------------------------------------------------------------------------
  // Workouts
  // ---------------------------------------------------------------------------

  const weeks: PrintableWeek[] =
    await Promise.all(
      weekDetails.map(
        async (
          week,
          weekIndex
        ) => {
          const rawWorkouts =
            Array.isArray(
              week?.workouts
            )
              ? week.workouts
              : [];

          const workouts: PrintableWorkout[] =
            await Promise.all(
              rawWorkouts.map(
                async (
                  workout,
                  workoutIndex
                ) => {
                  try {
                    const response =
                      await programService.getWorkoutDetail(
                        Number(workout.id)
                      );

                    const detailedWorkout =
                      getResponseData<RawWorkout>(
                        response
                      );

                    const rawExercises =
                      Array.isArray(
                        detailedWorkout?.exercises
                      )
                        ? detailedWorkout.exercises
                        : [];

                    const exercises =
                      rawExercises.map(
                        (exercise) =>
                          buildPrintableExercise(
                            exercise,
                            library
                          )
                      );

                    return {
                      id: Number(
                        detailedWorkout?.id ??
                          workout.id
                      ),

                      name:
                        detailedWorkout?.name ||
                        workout.name ||
                        `Workout ${
                          workoutIndex + 1
                        }`,

                      sequenceNumber:
                        Number(
                          detailedWorkout?.sequenceNumber ??
                            workout.sequenceNumber ??
                            workoutIndex + 1
                        ),

                      exercises,
                    };
                  } catch (error) {
                    console.error(
                      "[PDF EXPORT] getWorkoutDetail failed:",
                      {
                        workoutId:
                          workout.id,
                        weekId:
                          week.id,
                        error,
                        response: (
                          error as {
                            response?: {
                              status?: number;
                              data?: unknown;
                            };
                          }
                        )?.response,
                      }
                    );

                    throw error;
                  }
                }
              )
            );

          workouts.sort(
            (a, b) =>
              a.sequenceNumber -
              b.sequenceNumber
          );

          return {
            id: Number(week.id),

            sequenceNumber:
              Number(
                week.sequenceNumber ??
                  weekIndex + 1
              ),

            workouts,
          };
        }
      )
    );

  // ---------------------------------------------------------------------------
  // Sort weeks
  // ---------------------------------------------------------------------------

  weeks.sort(
    (a, b) =>
      a.sequenceNumber -
      b.sequenceNumber
  );

  // ---------------------------------------------------------------------------
  // Printable Program
  // ---------------------------------------------------------------------------

  return {
    name:
      template.name ||
      "Workout Program",

    description:
      template.description ||
      "",

    durationWeeks:
      weeks.length,

    status:
      template.status ||
      "DRAFT",

    weeks,
  };
}