import planTemplatesData from "../data/planTemplates.json";

import {
  PlanAssignment,
  StoredExercise,
  StoredWeek,
  StoredWorkout,
  TemplatePlan,
} from "../types/program.types";

import {
  getStorage,
  setStorage,
} from "./mockStorage";

const TEMPLATE_STORAGE_KEY =
  "msw_custom_templates";

const WEEK_STORAGE_KEY =
  "msw_template_weeks";

const WORKOUT_STORAGE_KEY =
  "msw_week_workouts";

const EXERCISE_STORAGE_KEY =
  "msw_workout_exercises";

const ASSIGNMENT_STORAGE_KEY =
  "msw_plan_assignments";

/* -------------------------------------------------------------------------- */
/* TEMPLATE STORAGE                                                           */
/* -------------------------------------------------------------------------- */

export function getTemplates(): TemplatePlan[] {
  return getStorage<TemplatePlan[]>(
    TEMPLATE_STORAGE_KEY,
    planTemplatesData as TemplatePlan[]
  );
}

export function saveTemplates(
  templates: TemplatePlan[]
): void {
  setStorage(
    TEMPLATE_STORAGE_KEY,
    templates
  );
}

/* -------------------------------------------------------------------------- */
/* WEEK STORAGE                                                               */
/* -------------------------------------------------------------------------- */

export function getWeeksStore(): Record<
  string,
  StoredWeek[]
> {
  return getStorage<
    Record<string, StoredWeek[]>
  >(
    WEEK_STORAGE_KEY,
    {}
  );
}

export function saveWeeksStore(
  weeksStore: Record<
    string,
    StoredWeek[]
  >
): void {
  setStorage(
    WEEK_STORAGE_KEY,
    weeksStore
  );
}

/* -------------------------------------------------------------------------- */
/* WORKOUT STORAGE                                                            */
/* -------------------------------------------------------------------------- */

export function getWorkoutsStore(): Record<
  string,
  StoredWorkout[]
> {
  return getStorage<
    Record<string, StoredWorkout[]>
  >(
    WORKOUT_STORAGE_KEY,
    {}
  );
}

export function saveWorkoutsStore(
  workoutsStore: Record<
    string,
    StoredWorkout[]
  >
): void {
  setStorage(
    WORKOUT_STORAGE_KEY,
    workoutsStore
  );
}

/* -------------------------------------------------------------------------- */
/* EXERCISE STORAGE                                                           */
/* -------------------------------------------------------------------------- */

export function getExercisesStore(): Record<
  string,
  StoredExercise[]
> {
  return getStorage<
    Record<string, StoredExercise[]>
  >(
    EXERCISE_STORAGE_KEY,
    {}
  );
}

export function saveExercisesStore(
  exercisesStore: Record<
    string,
    StoredExercise[]
  >
): void {
  setStorage(
    EXERCISE_STORAGE_KEY,
    exercisesStore
  );
}

/* -------------------------------------------------------------------------- */
/* ASSIGNMENT STORAGE                                                        */
/* -------------------------------------------------------------------------- */

export function getAssignments(): PlanAssignment[] {
  return getStorage<PlanAssignment[]>(
    ASSIGNMENT_STORAGE_KEY,
    []
  );
}

export function saveAssignments(
  assignments: PlanAssignment[]
): void {
  setStorage(
    ASSIGNMENT_STORAGE_KEY,
    assignments
  );
}

/* -------------------------------------------------------------------------- */
/* TEMPLATE HELPERS                                                           */
/* -------------------------------------------------------------------------- */

export function getTrainerTemplates(
  trainerId: number
): TemplatePlan[] {
  const templates =
    getTemplates();

  const weeksStore =
    getWeeksStore();

  return templates
    .filter(
      (template) =>
        Number(template.trainerId) ===
        trainerId
    )
    .map((template) => ({
      ...template,
      weeks:
        getTemplateWeeks(
          template,
          weeksStore
        ),
    }));
}

export function findTemplateForTrainer(
  templateId: number,
  trainerId: number
): TemplatePlan | undefined {
  const templates =
    getTemplates();

  return templates.find(
    (template) =>
      Number(template.trainerId) ===
        trainerId &&
      (
        Number(template.id) ===
          templateId ||
        Number(template.planId) ===
          templateId
      )
  );
}

export function getTemplateWeeks(
  template: TemplatePlan,
  weeksStore =
    getWeeksStore()
): StoredWeek[] {
  let weeks =
    weeksStore[
      String(template.id)
    ] || [];

  if (
    weeks.length === 0 &&
    template.planId
  ) {
    weeks =
      weeksStore[
        String(template.planId)
      ] || [];
  }

  if (weeks.length > 0) {
    return weeks;
  }

  return Object.values(
    weeksStore
  )
    .flat()
    .filter(
      (week) =>
        Number(
          week.planTemplateId
        ) ===
        Number(template.id)
    );
}

export function getWeekWorkouts(
  week: StoredWeek,
  workoutsStore =
    getWorkoutsStore()
): StoredWorkout[] {
  let workouts =
    workoutsStore[
      String(week.id)
    ] || [];

  if (workouts.length === 0) {
    workouts =
      Object.values(
        workoutsStore
      )
        .flat()
        .filter(
          (workout) =>
            Number(
              workout.weekTemplateId
            ) ===
            Number(week.id)
        );
  }

  return workouts;
}

export function getWorkoutExercises(
  workout: StoredWorkout,
  exercisesStore =
    getExercisesStore()
): StoredExercise[] {
  let exercises =
    exercisesStore[
      String(workout.id)
    ] || [];

  if (exercises.length === 0) {
    exercises =
      Object.values(
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

  return exercises;
}

/* -------------------------------------------------------------------------- */
/* ID HELPERS                                                                 */
/* -------------------------------------------------------------------------- */

let lastGeneratedId =
  Date.now();

export function getNextId(
  items: Array<{ id: number }>
): number {
  const maxId =
    items.reduce(
      (max, item) =>
        Math.max(
          max,
          Number(item.id) || 0
        ),
      0
    );

  const nextId =
    Math.max(
      maxId + 1,
      Date.now(),
      lastGeneratedId + 1
    );

  lastGeneratedId =
    nextId;

  return nextId;
}

/* -------------------------------------------------------------------------- */
/* ASSIGNMENT HELPERS                                                         */
/* -------------------------------------------------------------------------- */

export function isTemplateAssigned(
  template: TemplatePlan
): boolean {
  const assignments =
    getAssignments();

  const templateIds =
    new Set<number>([
      Number(template.id),
    ]);

  if (template.planId) {
    templateIds.add(
      Number(template.planId)
    );
  }

  return assignments.some(
    (assignment) =>
      templateIds.has(
        Number(
          assignment.planTemplateId
        )
      )
  );
}

/* -------------------------------------------------------------------------- */
/* DUPLICATE TEMPLATE                                                         */
/* -------------------------------------------------------------------------- */

export function duplicateTemplateData(
  originalTemplate: TemplatePlan,
  newPlanId: number
): TemplatePlan {
  const weeksStore =
    getWeeksStore();

  const workoutsStore =
    getWorkoutsStore();

  const exercisesStore =
    getExercisesStore();

  const originalWeeks =
    getTemplateWeeks(
      originalTemplate,
      weeksStore
    );

  const newWeeks:
    StoredWeek[] = [];

  let nextWeekId =
    getNextId(
      Object.values(
        weeksStore
      ).flat()
    );

  let nextWorkoutId =
    getNextId(
      Object.values(
        workoutsStore
      ).flat()
    );

  let nextExerciseId =
    getNextId(
      Object.values(
        exercisesStore
      ).flat()
    );

  for (
    let weekIndex = 0;
    weekIndex <
    originalWeeks.length;
    weekIndex++
  ) {
    const originalWeek =
      originalWeeks[
        weekIndex
      ];

    const newWeekId =
      nextWeekId++;

    const originalWorkouts =
      getWeekWorkouts(
        originalWeek,
        workoutsStore
      );

    const newWorkouts:
      StoredWorkout[] = [];

    const newWeek:
      StoredWeek = {
      ...originalWeek,
      id: newWeekId,
      weekId: newWeekId,
      planTemplateId:
        newPlanId,
      sequenceNumber:
        weekIndex,
      workouts: [],
    };

    for (
      let workoutIndex = 0;
      workoutIndex <
      originalWorkouts.length;
      workoutIndex++
    ) {
      const originalWorkout =
        originalWorkouts[
          workoutIndex
        ];

      const newWorkoutId =
        nextWorkoutId++;

      const originalExercises =
        getWorkoutExercises(
          originalWorkout,
          exercisesStore
        );

      const newExercises:
        StoredExercise[] = [];

      const newWorkout:
        StoredWorkout = {
        ...originalWorkout,
        id: newWorkoutId,
        workoutTemplateId:
          newWorkoutId,
        weekTemplateId:
          newWeekId,
        sequenceNumber:
          workoutIndex,
      };

      for (
        let exerciseIndex = 0;
        exerciseIndex <
        originalExercises.length;
        exerciseIndex++
      ) {
        const originalExercise =
          originalExercises[
            exerciseIndex
          ];

        const newExerciseId =
          nextExerciseId++;

        const newExercise:
          StoredExercise = {
          ...originalExercise,
          id: newExerciseId,
          exerciseTemplateId:
            newExerciseId,
          workoutTemplateId:
            newWorkoutId,
          sequenceNumber:
            exerciseIndex,
        };

        newExercises.push(
          newExercise
        );
      }

      exercisesStore[
        String(newWorkoutId)
      ] = newExercises;

      newWorkouts.push(
        newWorkout
      );
    }

    workoutsStore[
      String(newWeekId)
    ] = newWorkouts;

    newWeek.workouts =
      newWorkouts;

    newWeeks.push(
      newWeek
    );
  }

  weeksStore[
    String(newPlanId)
  ] = newWeeks;

  saveWeeksStore(
    weeksStore
  );

  saveWorkoutsStore(
    workoutsStore
  );

  saveExercisesStore(
    exercisesStore
  );

  return {
    ...originalTemplate,
    id: newPlanId,
    planId: newPlanId,
    name: `${originalTemplate.name} (Copy)`,
    status: "DRAFT",
    weeks: newWeeks,
  };
}

/* -------------------------------------------------------------------------- */
/* DELETE TEMPLATE CASCADE                                                    */
/* -------------------------------------------------------------------------- */

export function deleteTemplateCascade(
  template: TemplatePlan
): void {
  const weeksStore =
    getWeeksStore();

  const workoutsStore =
    getWorkoutsStore();

  const exercisesStore =
    getExercisesStore();

  const templateIds =
    new Set<number>([
      Number(template.id),
    ]);

  if (template.planId) {
    templateIds.add(
      Number(template.planId)
    );
  }

  const deletedWeekIds =
    new Set<number>();

  const deletedWorkoutIds =
    new Set<number>();

  /*
   * Find weeks stored directly under
   * the template ID.
   */
  for (const templateId of templateIds) {
    const weeks =
      weeksStore[
        String(templateId)
      ] || [];

    for (const week of weeks) {
      deletedWeekIds.add(
        Number(week.id)
      );
    }

    delete weeksStore[
      String(templateId)
    ];
  }

  /*
   * Find any other weeks that reference
   * this template through planTemplateId.
   */
  for (const key of Object.keys(
    weeksStore
  )) {
    const weeks =
      weeksStore[key] || [];

    const remainingWeeks =
      weeks.filter((week) => {
        const belongsToTemplate =
          templateIds.has(
            Number(
              week.planTemplateId
            )
          );

        if (
          belongsToTemplate
        ) {
          deletedWeekIds.add(
            Number(week.id)
          );
        }

        return !belongsToTemplate;
      });

    if (
      remainingWeeks.length ===
      0
    ) {
      delete weeksStore[key];
    } else {
      weeksStore[key] =
        remainingWeeks;
    }
  }

  /*
   * Find workouts belonging to
   * deleted weeks.
   */
  for (const key of Object.keys(
    workoutsStore
  )) {
    const workouts =
      workoutsStore[key] || [];

    const remainingWorkouts =
      workouts.filter(
        (workout) => {
          const belongsToDeletedWeek =
            deletedWeekIds.has(
              Number(
                workout.weekTemplateId
              )
            );

          if (
            belongsToDeletedWeek
          ) {
            deletedWorkoutIds.add(
              Number(
                workout.id
              )
            );
          }

          return !belongsToDeletedWeek;
        }
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

  /*
   * Remove exercises belonging to
   * deleted workouts.
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

  saveWeeksStore(
    weeksStore
  );

  saveWorkoutsStore(
    workoutsStore
  );

  saveExercisesStore(
    exercisesStore
  );
}