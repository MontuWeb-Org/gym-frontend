import { http, HttpResponse } from "msw";
import exercisesData from "../data/exercises.json";

// Persistent helpers using localStorage so data survives sidebar navigation and reloads
const getStorage = (key: string, fallback: any) => {
  if (typeof window === "undefined") return fallback;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : fallback;
};

const setStorage = (key: string, data: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const programHandlers = [
  // 1. Get all templates (includes saved drafts)
  http.get('/api/plans/templates', () => {
    const customTemplates = getStorage("msw_custom_templates", [
      { id: 1, name: "Master Hypertrophy Plan", description: "Advanced volume training block", status: "DRAFT", durationWeekTemplates: 4, isFav: true },
      { id: 2, name: "Custom Hypertrophy Plan", description: "Hypertrophy focus routine", status: "ACTIVE", durationWeekTemplates: 4, isFav: false }
    ]);
    return HttpResponse.json({
      data: { plans: customTemplates },
      pagination: { total: customTemplates.length, page: 1, limit: 10, totalPages: 1 }
    });
  }),

  http.get('*/api/plans/templates', () => {
    const customTemplates = getStorage("msw_custom_templates", [
      { id: 1, name: "Master Hypertrophy Plan", description: "Advanced volume training block", status: "DRAFT", durationWeekTemplates: 4, isFav: true },
      { id: 2, name: "Custom Hypertrophy Plan", description: "Hypertrophy focus routine", status: "ACTIVE", durationWeekTemplates: 4, isFav: false }
    ]);
    return HttpResponse.json({
      data: { plans: customTemplates },
      pagination: { total: customTemplates.length, page: 1, limit: 10, totalPages: 1 }
    });
  }),

  // 2. Create template / Save Draft
  http.post('/api/plans/templates', async ({ request }) => {
    const body = (await request.json()) as { name: string; description: string };
    const newPlanId = Date.now();
    const newPlan = {
      planId: newPlanId,
      id: newPlanId,
      name: body.name,
      description: body.description,
      status: "DRAFT",
      weeks: []
    };

    const templates = getStorage("msw_custom_templates", []);
    setStorage("msw_custom_templates", [newPlan, ...templates]);

    return HttpResponse.json({ data: newPlan }, { status: 200 });
  }),

  http.post('*/api/plans/templates', async ({ request }) => {
    const body = (await request.json()) as { name: string; description: string };
    const newPlanId = Date.now();
    const newPlan = {
      planId: newPlanId,
      id: newPlanId,
      name: body.name,
      description: body.description,
      status: "DRAFT",
      weeks: []
    };

    const templates = getStorage("msw_custom_templates", []);
    setStorage("msw_custom_templates", [newPlan, ...templates]);

    return HttpResponse.json({ data: newPlan }, { status: 200 });
  }),

  // 3. Get template detail & its weeks (Auto-registers ID if it came from query params/client generation)
  http.get('/api/plans/templates/:id', ({ params }) => {
    const { id } = params;
    const templateIdNum = Number(id);
    const weeksStore = getStorage("msw_template_weeks", {});
    
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
    const weeksStore = getStorage("msw_template_weeks", {});
    
    return HttpResponse.json({
      data: {
        id: templateIdNum,
        name: `Custom Template #${templateIdNum}`,
        description: "Program workspace",
        weeks: weeksStore[templateIdNum] || []
      }
    });
  }),

  // 4. Create Week
  http.post('/api/plans/templates/weeks', async ({ request }) => {
    const body = (await request.json()) as { sequenceNumber: number; planTemplateId: number };
    const newWeekId = Date.now();
    const newWeek = { id: newWeekId, weekId: newWeekId, ...body, workouts: [] };

    const weeksStore = getStorage("msw_template_weeks", {});
    if (!weeksStore[body.planTemplateId]) {
      weeksStore[body.planTemplateId] = [];
    }
    if (!weeksStore[body.planTemplateId].some((w: any) => w.id === newWeekId)) {
      weeksStore[body.planTemplateId].push(newWeek);
    }
    setStorage("msw_template_weeks", weeksStore);

    return HttpResponse.json({ data: newWeek }, { status: 200 });
  }),

  http.post('*/api/plans/templates/weeks', async ({ request }) => {
    const body = (await request.json()) as { sequenceNumber: number; planTemplateId: number };
    const newWeekId = Date.now();
    const newWeek = { id: newWeekId, weekId: newWeekId, ...body, workouts: [] };

    const weeksStore = getStorage("msw_template_weeks", {});
    if (!weeksStore[body.planTemplateId]) {
      weeksStore[body.planTemplateId] = [];
    }
    if (!weeksStore[body.planTemplateId].some((w: any) => w.id === newWeekId)) {
      weeksStore[body.planTemplateId].push(newWeek);
    }
    setStorage("msw_template_weeks", weeksStore);

    return HttpResponse.json({ data: newWeek }, { status: 200 });
  }),

  // 5. Get Week detail & workouts (Auto-registers empty workouts list if dynamically accessed)
  http.get('/api/plans/templates/weeks/:id', ({ params }) => {
    const { id } = params;
    const weekIdNum = Number(id);
    const workoutsStore = getStorage("msw_week_workouts", {});

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
    const workoutsStore = getStorage("msw_week_workouts", {});

    return HttpResponse.json({
      data: {
        id: weekIdNum,
        workouts: workoutsStore[weekIdNum] || []
      }
    });
  }),

  // 6. Create Workout
  http.post('/api/plans/templates/workouts', async ({ request }) => {
    const body = (await request.json()) as { name: string; sequenceNumber: number; weekTemplateId: number };
    const newWorkoutId = Date.now();
    const newWorkout = { id: newWorkoutId, workoutTemplateId: newWorkoutId, ...body, exercises: [] };

    const workoutsStore = getStorage("msw_week_workouts", {});
    if (!workoutsStore[body.weekTemplateId]) {
      workoutsStore[body.weekTemplateId] = [];
    }
    workoutsStore[body.weekTemplateId].push(newWorkout);
    setStorage("msw_week_workouts", workoutsStore);

    return HttpResponse.json({ data: newWorkout }, { status: 200 });
  }),

  http.post('*/api/plans/templates/workouts', async ({ request }) => {
    const body = (await request.json()) as { name: string; sequenceNumber: number; weekTemplateId: number };
    const newWorkoutId = Date.now();
    const newWorkout = { id: newWorkoutId, workoutTemplateId: newWorkoutId, ...body, exercises: [] };

    const workoutsStore = getStorage("msw_week_workouts", {});
    if (!workoutsStore[body.weekTemplateId]) {
      workoutsStore[body.weekTemplateId] = [];
    }
    workoutsStore[body.weekTemplateId].push(newWorkout);
    setStorage("msw_week_workouts", workoutsStore);

    return HttpResponse.json({ data: newWorkout }, { status: 200 });
  }),

  // 7. Get Workout detail & exercises (Auto-registers session if accessed directly)
  http.get('/api/plans/templates/workouts/:id', ({ params }) => {
    const { id } = params;
    const workoutIdNum = Number(id);
    const workoutsStore = getStorage("msw_week_workouts", {});
    const exercisesStore = getStorage("msw_workout_exercises", {});

    let foundWorkoutName = "Workout Session";
    for (const weekId in workoutsStore) {
      const match = workoutsStore[weekId].find((w: any) => w.id === workoutIdNum || w.workoutTemplateId === workoutIdNum);
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
    const workoutsStore = getStorage("msw_week_workouts", {});
    const exercisesStore = getStorage("msw_workout_exercises", {});

    let foundWorkoutName = "Workout Session";
    for (const weekId in workoutsStore) {
      const match = workoutsStore[weekId].find((w: any) => w.id === workoutIdNum || w.workoutTemplateId === workoutIdNum);
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

  // 8. Add Exercise to Workout
  http.post('/api/plans/templates/exercises', async ({ request }) => {
    const body = (await request.json()) as { workoutTemplateId: number; exerciseId: number; sets: any[] };
    const newExerciseId = Date.now();
    const newExercise = { id: newExerciseId, ...body };

    const exercisesStore = getStorage("msw_workout_exercises", {});
    if (!exercisesStore[body.workoutTemplateId]) {
      exercisesStore[body.workoutTemplateId] = [];
    }
    exercisesStore[body.workoutTemplateId].push(newExercise);
    setStorage("msw_workout_exercises", exercisesStore);

    return HttpResponse.json({ data: newExercise }, { status: 200 });
  }),

  http.post('*/api/plans/templates/exercises', async ({ request }) => {
    const body = (await request.json()) as { workoutTemplateId: number; exerciseId: number; sets: any[] };
    const newExerciseId = Date.now();
    const newExercise = { id: newExerciseId, ...body };

    const exercisesStore = getStorage("msw_workout_exercises", {});
    if (!exercisesStore[body.workoutTemplateId]) {
      exercisesStore[body.workoutTemplateId] = [];
    }
    exercisesStore[body.workoutTemplateId].push(newExercise);
    setStorage("msw_workout_exercises", exercisesStore);

    return HttpResponse.json({ data: newExercise }, { status: 200 });
  }),

  // 9. Get Exercise Library (Loaded from exercises.json)
  http.get('/api/exercises', () => {
    const list = Array.isArray(exercisesData) 
      ? exercisesData 
      : (exercisesData as any).exercises || (exercisesData as any).data || [];

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
      : (exercisesData as any).exercises || (exercisesData as any).data || [];

    return HttpResponse.json({
      data: {
        exercises: list
      },
      pagination: { total: list.length, page: 1, limit: 50, totalPages: 1 }
    });
  }),
];