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

const getResponseData = <T,>(response: {
  data?: {
    data?: T;
  } & T;
}): T => {
  return (
    response.data?.data ??
    response.data
  ) as T;
};

const getLibraryExercises = (
  response: any
): RawLibraryExercise[] => {
  const data =
    response?.data?.data ??
    response?.data ??
    [];

  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    Array.isArray(data.exercises)
  ) {
    return data.exercises;
  }

  return [];
};

const getNumber = (
  value: unknown,
  fallback: number
) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : fallback;
};

const buildPrintableExercise = (
  exercise: RawExercise,
  library: RawLibraryExercise[]
): PrintableExercise => {
  const libraryExercise =
    library.find(
      (item) =>
        item.id === exercise.exerciseId
    );

  const savedSets = Array.isArray(
    exercise.sets
  )
    ? exercise.sets
    : [];

  /*
   * Use the edited/default values first.
   * Fall back to the original saved exercise
   * values for exercises that have not been edited.
   */
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
};

export async function prepareProgramForExport(
  templateId: number
): Promise<PrintableProgram> {
  /*
   * Fetch the template and exercise library
   * at the same time.
   */
  const [
    templateResponse,
    exercisesResponse,
  ] = await Promise.all([
    programService.getTemplateDetail(
      templateId
    ),
    programService.getExercises(
      1,
      1000
    ),
  ]);

  const template =
    getResponseData<RawTemplate>(
      templateResponse
    );

  const library =
    getLibraryExercises(
      exercisesResponse
    );

  const rawWeeks =
    template.weeks || [];

  /*
   * Fetch complete week details.
   */
  const weekDetails =
    await Promise.all(
      rawWeeks.map(
        async (week) => {
          const response =
            await programService.getWeekDetail(
              Number(week.id)
            );

          return getResponseData<RawWeek>(
            response
          );
        }
      )
    );

  /*
   * Build the printable week structure.
   */
  const weeks: PrintableWeek[] =
    await Promise.all(
      weekDetails.map(
        async (
          week,
          weekIndex
        ) => {
          const rawWorkouts =
            week.workouts || [];

          /*
           * Fetch complete workout details.
           */
          const workouts: PrintableWorkout[] =
            await Promise.all(
              rawWorkouts.map(
                async (
                  workout,
                  workoutIndex
                ) => {
                  const response =
                    await programService.getWorkoutDetail(
                      Number(
                        workout.id
                      )
                    );

                  const detailedWorkout =
                    getResponseData<RawWorkout>(
                      response
                    );

                  const rawExercises =
                    detailedWorkout.exercises ||
                    [];

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
                      detailedWorkout.id ??
                        workout.id
                    ),

                    name:
                      detailedWorkout.name ||
                      workout.name ||
                      `Workout ${
                        workoutIndex + 1
                      }`,

                    sequenceNumber:
                      Number(
                        detailedWorkout.sequenceNumber ??
                          workout.sequenceNumber ??
                          workoutIndex + 1
                      ),

                    exercises,
                  };
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

  weeks.sort(
    (a, b) =>
      a.sequenceNumber -
      b.sequenceNumber
  );

  return {
    name:
      template.name ||
      "Workout Program",

    description:
      template.description ||
      "",

    durationWeeks: weeks.length,

    status:
      template.status ||
      "DRAFT",

    weeks,
  };
}