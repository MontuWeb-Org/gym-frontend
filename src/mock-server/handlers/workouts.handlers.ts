import { http, HttpResponse } from "msw";
import exercisesData from "../data/exercises.json";

interface WorkoutItem {
  id: number;
  workoutTemplateId?: number;
  name?: string;
  [key: string]: unknown;
}

interface ExerciseItem {
  id: number;
  exerciseId?: number;
  sets?: Array<{ weight?: number; [key: string]: unknown }>;
  reps?: string | number;
  rest?: number;
  [key: string]: unknown;
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

export const workoutHandlers = [
  http.post('/api/plans/templates/workouts', async ({ request }) => {
    const body = (await request.json()) as { name: string; sequenceNumber: number; weekTemplateId: number };
    const newWorkoutId = Date.now();
    const newWorkout = { id: newWorkoutId, workoutTemplateId: newWorkoutId, ...body, exercises: [] };

    const workoutsStore = getStorage<Record<number, WorkoutItem[]>>("msw_week_workouts", {});
    if (!workoutsStore[body.weekTemplateId]) {
      workoutsStore[body.weekTemplateId] = [];
    }
    workoutsStore[body.weekTemplateId].push(newWorkout);
    setStorage("msw_week_workouts", workoutsStore);

    return HttpResponse.json({ data: newWorkout }, { status: 200 });
  }),

  http.put('/api/plans/templates/workouts/:id', async ({ params, request }) => {
    const { id } = params;
    const workoutIdNum = Number(id);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    
    const workoutsStore = getStorage<Record<number, WorkoutItem[]>>("msw_week_workouts", {});
    for (const weekId in workoutsStore) {
      workoutsStore[Number(weekId)] = workoutsStore[Number(weekId)].map((w: WorkoutItem) => {
        if (w.id === workoutIdNum || w.workoutTemplateId === workoutIdNum) {
          return { ...w, ...body };
        }
        return w;
      });
    }
    setStorage("msw_week_workouts", workoutsStore);

    return HttpResponse.json({ data: { id: workoutIdNum, ...body } }, { status: 200 });
  }),

  http.get('/api/plans/templates/workouts/:id', ({ params }) => {
    const { id } = params;
    const workoutIdNum = Number(id);
    const workoutsStore = getStorage<Record<number, WorkoutItem[]>>("msw_week_workouts", {});
    const exercisesStore = getStorage<Record<number, unknown[]>>("msw_workout_exercises", {});

    let foundWorkoutName = "Workout Session";
    for (const weekId in workoutsStore) {
      const match = workoutsStore[Number(weekId)].find((w) => w.id === workoutIdNum || w.workoutTemplateId === workoutIdNum);
      if (match && match.name) {
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
    const body = (await request.json()) as { workoutTemplateId: number; exerciseId: number; sets: unknown[] };
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

  http.put('/api/plans/templates/exercises/:id', async ({ params, request }) => {
    const { id } = params;
    const exerciseIdNum = Number(id);
    const body = (await request.json()) as Record<string, unknown>;
    
    const exercisesStore = getStorage<Record<number, ExerciseItem[]>>("msw_workout_exercises", {});
    
    // Map frontend payload fields (defaultSets, defaultReps, defaultRestTimeSeconds)
    const newSetsCount = body.defaultSets !== undefined ? Number(body.defaultSets) : (body.sets !== undefined ? Number(body.sets) : undefined);
    const newReps = body.defaultReps !== undefined ? String(body.defaultReps) : (body.reps !== undefined ? String(body.reps) : undefined);
    const newRest = body.defaultRestTimeSeconds !== undefined ? Number(body.defaultRestTimeSeconds) : (body.rest !== undefined ? Number(body.rest) : undefined);

    for (const workoutId in exercisesStore) {
      if (!Array.isArray(exercisesStore[Number(workoutId)])) continue;
      
      exercisesStore[Number(workoutId)] = exercisesStore[Number(workoutId)].map((ex: ExerciseItem) => {
        if (ex.id === exerciseIdNum || ex.exerciseId === exerciseIdNum) {
          const targetSetsCount = newSetsCount !== undefined ? newSetsCount : (ex.sets?.length || 3);
          const targetReps = newReps !== undefined ? newReps : (ex.reps || 10);
          
          let updatedSets = ex.sets;
          if (newSetsCount !== undefined || newReps !== undefined) {
            updatedSets = Array.from({ length: targetSetsCount }, (_, i) => ({
              setNumber: i + 1,
              reps: targetReps,
              weight: ex.sets?.[i]?.weight || 0
            }));
          }

          return {
            ...ex,
            ...body,
            reps: targetReps,
            sets: updatedSets,
            rest: newRest !== undefined ? newRest : ex.rest
          };
        }
        return ex;
      });
    }

    setStorage("msw_workout_exercises", exercisesStore);

    return HttpResponse.json({ message: "Exercise updated successfully." }, { status: 200 });
  }),

  http.put('/api/plans/templates/workouts/:id/exercises/reorder', async ({ params, request }) => {
    const { id } = params;
    const workoutIdNum = Number(id);
    const body = (await request.json().catch(() => ({}))) as { exercises: unknown[] };
    
    const exercisesStore = getStorage<Record<number, unknown[]>>("msw_workout_exercises", {});
    exercisesStore[workoutIdNum] = body.exercises;
    setStorage("msw_workout_exercises", exercisesStore);

    return HttpResponse.json({ message: "Exercises reordered successfully" }, { status: 200 });
  }),

  http.get('/api/exercises', () => {
    const list = Array.isArray(exercisesData) 
      ? exercisesData 
      : (exercisesData as { exercises?: unknown[]; data?: unknown[] }).exercises || (exercisesData as { exercises?: unknown[]; data?: unknown[] }).data || [];

    return HttpResponse.json({
      data: { exercises: list },
      pagination: { total: list.length, page: 1, limit: 50, totalPages: 1 }
    });
  }),
];