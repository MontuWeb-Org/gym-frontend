import { http, HttpResponse } from "msw";
import exercisesData from "../data/exercises.json";

interface TemplatePlan {
  id: number;
  name: string;
  description: string;
  status: string;
  durationWeekTemplates: number;
  isFav: boolean;
}

interface TemplateBody {
  name: string;
  description: string;
}

interface WeekBody {
  sequenceNumber: number;
  planTemplateId: number;
}

interface WorkoutBody {
  name: string;
  sequenceNumber: number;
  weekTemplateId: number;
}

interface ExerciseBody {
  workoutTemplateId: number;
  exerciseId: number;
  sets: unknown[];
}

const getStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : fallback;
};

const setStorage = <T>(key: string, data: T): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const programHandlers = [
  http.get('/api/plans/templates', () => {
    const customTemplates = getStorage<TemplatePlan[]>("msw_custom_templates", [
      { id: 1, name: "Master Hypertrophy Plan", description: "Advanced volume training block", status: "DRAFT", durationWeekTemplates: 4, isFav: true },
      { id: 2, name: "Custom Hypertrophy Plan", description: "Hypertrophy focus routine", status: "ACTIVE", durationWeekTemplates: 4, isFav: false }
    ]);
    return HttpResponse.json({
      data: { plans: customTemplates },
      pagination: { total: customTemplates.length, page: 1, limit: 10, totalPages: 1 }
    });
  }),

  http.get('*/api/plans/templates', () => {
    const customTemplates = getStorage<TemplatePlan[]>("msw_custom_templates", [
      { id: 1, name: "Master Hypertrophy Plan", description: "Advanced volume training block", status: "DRAFT", durationWeekTemplates: 4, isFav: true },
      { id: 2, name: "Custom Hypertrophy Plan", description: "Hypertrophy focus routine", status: "ACTIVE", durationWeekTemplates: 4, isFav: false }
    ]);
    return HttpResponse.json({
      data: { plans: customTemplates },
      pagination: { total: customTemplates.length, page: 1, limit: 10, totalPages: 1 }
    });
  }),

  http.post('/api/plans/templates', async ({ request }) => {
    const body = (await request.json()) as TemplateBody;
    const newPlanId = Date.now();
    const newPlan = {
      planId: newPlanId,
      id: newPlanId,
      name: body.name,
      description: body.description,
      status: "DRAFT",
      weeks: []
    };

    const templates = getStorage<TemplatePlan[]>("msw_custom_templates", []);
    setStorage("msw_custom_templates", [newPlan, ...templates]);

    return HttpResponse.json({ data: newPlan }, { status: 200 });
  }),

  http.post('*/api/plans/templates', async ({ request }) => {
    const body = (await request.json()) as TemplateBody;
    const newPlanId = Date.now();
    const newPlan = {
      planId: newPlanId,
      id: newPlanId,
      name: body.name,
      description: body.description,
      status: "DRAFT",
      weeks: []
    };

    const templates = getStorage<TemplatePlan[]>("msw_custom_templates", []);
    setStorage("msw_custom_templates", [newPlan, ...templates]);

    return HttpResponse.json({ data: newPlan }, { status: 200 });
  }),

  http.get('/api/plans/templates/:id', ({ params }) => {
    const { id } = params;
    const templateIdNum = Number(id);
    const weeksStore = getStorage<Record<number, unknown[]>>("msw_template_weeks", {});
    
    return HttpResponse.json({
      data: {
        id: templateIdNum,
        name: `Custom Template #${templateIdNum}`,
        description: "Program workspace",
        weeks: weeksStore[templateIdNum] || []
      }
    });
  }),

  http.get('*/api/plans/templates/:id', ({ params }) => {
    const { id } = params;
    const templateIdNum = Number(id);
    const weeksStore = getStorage<Record<number, unknown[]>>("msw_template_weeks", {});
    
    return HttpResponse.json({
      data: {
        id: templateIdNum,
        name: `Custom Template #${templateIdNum}`,
        description: "Program workspace",
        weeks: weeksStore[templateIdNum] || []
      }
    });
  }),

  http.post('/api/plans/templates/weeks', async ({ request }) => {
    const body = (await request.json()) as WeekBody;
    const newWeekId = Date.now();
    const newWeek = { id: newWeekId, weekId: newWeekId, ...body, workouts: [] };

    const weeksStore = getStorage<Record<number, unknown[]>>("msw_template_weeks", {});
    if (!weeksStore[body.planTemplateId]) {
      weeksStore[body.planTemplateId] = [];
    }
    weeksStore[body.planTemplateId].push(newWeek);
    setStorage("msw_template_weeks", weeksStore);

    return HttpResponse.json({ data: newWeek }, { status: 200 });
  }),

  http.post('*/api/plans/templates/weeks', async ({ request }) => {
    const body = (await request.json()) as WeekBody;
    const newWeekId = Date.now();
    const newWeek = { id: newWeekId, weekId: newWeekId, ...body, workouts: [] };

    const weeksStore = getStorage<Record<number, unknown[]>>("msw_template_weeks", {});
    if (!weeksStore[body.planTemplateId]) {
      weeksStore[body.planTemplateId] = [];
    }
    weeksStore[body.planTemplateId].push(newWeek);
    setStorage("msw_template_weeks", weeksStore);

    return HttpResponse.json({ data: newWeek }, { status: 200 });
  }),

  http.get('/api/plans/templates/weeks/:id', ({ params }) => {
    const { id } = params;
    const weekIdNum = Number(id);
    const workoutsStore = getStorage<Record<number, unknown[]>>("msw_week_workouts", {});

    return HttpResponse.json({
      data: {
        id: weekIdNum,
        workouts: workoutsStore[weekIdNum] || []
      }
    });
  }),

  http.get('*/api/plans/templates/weeks/:id', ({ params }) => {
    const { id } = params;
    const weekIdNum = Number(id);
    const workoutsStore = getStorage<Record<number, unknown[]>>("msw_week_workouts", {});

    return HttpResponse.json({
      data: {
        id: weekIdNum,
        workouts: workoutsStore[weekIdNum] || []
      }
    });
  }),

  http.post('/api/plans/templates/workouts', async ({ request }) => {
    const body = (await request.json()) as WorkoutBody;
    const newWorkoutId = Date.now();
    const newWorkout = { id: newWorkoutId, workoutTemplateId: newWorkoutId, ...body, exercises: [] };

    const workoutsStore = getStorage<Record<number, unknown[]>>("msw_week_workouts", {});
    if (!workoutsStore[body.weekTemplateId]) {
      workoutsStore[body.weekTemplateId] = [];
    }
    workoutsStore[body.weekTemplateId].push(newWorkout);
    setStorage("msw_week_workouts", workoutsStore);

    return HttpResponse.json({ data: newWorkout }, { status: 200 });
  }),

  http.post('*/api/plans/templates/workouts', async ({ request }) => {
    const body = (await request.json()) as WorkoutBody;
    const newWorkoutId = Date.now();
    const newWorkout = { id: newWorkoutId, workoutTemplateId: newWorkoutId, ...body, exercises: [] };

    const workoutsStore = getStorage<Record<number, unknown[]>>("msw_week_workouts", {});
    if (!workoutsStore[body.weekTemplateId]) {
      workoutsStore[body.weekTemplateId] = [];
    }
    workoutsStore[body.weekTemplateId].push(newWorkout);
    setStorage("msw_week_workouts", workoutsStore);

    return HttpResponse.json({ data: newWorkout }, { status: 200 });
  }),

  http.get('/api/plans/templates/workouts/:id', ({ params }) => {
    const { id } = params;
    const workoutIdNum = Number(id);
    const workoutsStore = getStorage<Record<number, Array<{ id?: number; workoutTemplateId?: number; name: string }>>>("msw_week_workouts", {});
    const exercisesStore = getStorage<Record<number, unknown[]>>("msw_workout_exercises", {});

    let foundWorkoutName = "Workout Session";
    for (const weekId in workoutsStore) {
      const match = workoutsStore[Number(weekId)].find((w) => w.id === workoutIdNum || w.workoutTemplateId === workoutIdNum);
      if (match) {
        foundWorkoutName = match.name;
        break;
      }
    }

    return HttpResponse.json({
      data: {
        id: workoutIdNum,
        name: foundWorkoutName,
        exercises: exercisesStore[workoutIdNum] || []
      }
    });
  }),

  http.get('*/api/plans/templates/workouts/:id', ({ params }) => {
    const { id } = params;
    const workoutIdNum = Number(id);
    const workoutsStore = getStorage<Record<number, Array<{ id?: number; workoutTemplateId?: number; name: string }>>>("msw_week_workouts", {});
    const exercisesStore = getStorage<Record<number, unknown[]>>("msw_workout_exercises", {});

    let foundWorkoutName = "Workout Session";
    for (const weekId in workoutsStore) {
      const match = workoutsStore[Number(weekId)].find((w) => w.id === workoutIdNum || w.workoutTemplateId === workoutIdNum);
      if (match) {
        foundWorkoutName = match.name;
        break;
      }
    }

    return HttpResponse.json({
      data: {
        id: workoutIdNum,
        name: foundWorkoutName,
        exercises: exercisesStore[workoutIdNum] || []
      }
    });
  }),

  http.post('/api/plans/templates/exercises', async ({ request }) => {
    const body = (await request.json()) as ExerciseBody;
    const newExerciseId = Date.now();
    const newExercise = { id: newExerciseId, ...body };

    const exercisesStore = getStorage<Record<number, unknown[]>>("msw_workout_exercises", {});
    if (!exercisesStore[body.workoutTemplateId]) {
      exercisesStore[body.workoutTemplateId] = [];
    }
    exercisesStore[body.workoutTemplateId].push(newExercise);
    setStorage("msw_workout_exercises", exercisesStore);

    return HttpResponse.json({ data: newExercise }, { status: 200 });
  }),

  http.post('*/api/plans/templates/exercises', async ({ request }) => {
    const body = (await request.json()) as ExerciseBody;
    const newExerciseId = Date.now();
    const newExercise = { id: newExerciseId, ...body };

    const exercisesStore = getStorage<Record<number, unknown[]>>("msw_workout_exercises", {});
    if (!exercisesStore[body.workoutTemplateId]) {
      exercisesStore[body.workoutTemplateId] = [];
    }
    exercisesStore[body.workoutTemplateId].push(newExercise);
    setStorage("msw_workout_exercises", exercisesStore);

    return HttpResponse.json({ data: newExercise }, { status: 200 });
  }),

  http.get('/api/exercises', () => {
    const list = Array.isArray(exercisesData) 
      ? exercisesData 
      : (exercisesData as { exercises?: unknown[]; data?: unknown[] }).exercises || (exercisesData as { exercises?: unknown[]; data?: unknown[] }).data || [];

    return HttpResponse.json({
      data: {
        exercises: list
      },
      pagination: { total: list.length, page: 1, limit: 50, totalPages: 1 }
    });
  }),

  http.get('*/api/exercises', () => {
    const list = Array.isArray(exercisesData) 
      ? exercisesData 
      : (exercisesData as { exercises?: unknown[]; data?: unknown[] }).exercises || (exercisesData as { exercises?: unknown[]; data?: unknown[] }).data || [];

    return HttpResponse.json({
      data: {
        exercises: list
      },
      pagination: { total: list.length, page: 1, limit: 50, totalPages: 1 }
    });
  }),
];