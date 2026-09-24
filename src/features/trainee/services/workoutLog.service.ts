// src/features/trainee/services/workoutLog.service.ts
import { authApi } from '@/lib/axios';
import { enqueue } from '@/lib/offlineQueue';
import { WorkoutSession, ExerciseLogDraft } from '../types/workoutLog.types';

function extractWorkoutLogId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (!value || typeof value !== 'object') return null;

  const object = value as Record<string, unknown>;
  for (const key of ['workoutLogId', 'workoutLog', 'log', 'data', 'id']) {
    const id = extractWorkoutLogId(object[key]);
    if (id !== null) return id;
  }
  return null;
}

export async function startWorkout(session: WorkoutSession): Promise<number | null> {
  const payload = {
    planAssignmentId: session.planAssignmentId,
    workoutTemplateId: session.workoutTemplateId,
    startedAt: session.startedAt,
  };

  if (!navigator.onLine) {
    await enqueue({ sessionTempId: session.tempId, kind: 'start-workout', payload });
    return null;
  }

  let responseData: unknown;
  try {
    const response = await authApi.post('/logs/workouts', payload);
    responseData = response.data;
  } catch {
    await enqueue({ sessionTempId: session.tempId, kind: 'start-workout', payload });
    return null;
  }

  const workoutLogId = extractWorkoutLogId(responseData);
  if (workoutLogId === null) {
    throw new Error('Start workout response did not contain a numeric workout log ID');
  }
  return workoutLogId;
}

export async function logExercise(
  sessionTempId: string,
  workoutLogId: number | null,
  exercise: ExerciseLogDraft
) {
  if (workoutLogId !== null && !Number.isInteger(workoutLogId)) {
    throw new Error('Cannot log exercise without a numeric workout log ID');
  }
  const payload = {
    workoutLogId: workoutLogId ?? undefined, // filled in by sync engine if null
    workoutExerciseTemplateId: exercise.workoutExerciseTemplateId,
    sequenceNumber: exercise.sequenceNumber,
    planAssignmentId: exercise.planAssignmentId,
    sets: exercise.sets,
    startedAt: exercise.startedAt,
    endedAt: exercise.endedAt,
  };

  // still waiting on the start request to resolve — must queue, can't send
  if (workoutLogId === null) {
    await enqueue({ sessionTempId, kind: 'log-exercise', payload });
    return;
  }

  if (!navigator.onLine) {
    await enqueue({ sessionTempId, kind: 'log-exercise', payload });
    return;
  }

  try {
    await authApi.post('/logs/exercises', payload);
  } catch {
    await enqueue({ sessionTempId, kind: 'log-exercise', payload });
  }
}

export async function completeWorkout(
  sessionTempId: string,
  workoutLogId: number | null,
  endedAt: string,
  notes?: string
) {
  if (workoutLogId !== null && !Number.isInteger(workoutLogId)) {
    throw new Error('Cannot complete workout without a numeric workout log ID');
  }
  const payload = { endedAt, notes };

  if (workoutLogId === null || !navigator.onLine) {
    await enqueue({ sessionTempId, kind: 'complete-workout', payload });
    return;
  }

  try {
    await authApi.patch(`/logs/workouts/${workoutLogId}/complete`, payload);
  } catch {
    await enqueue({ sessionTempId, kind: 'complete-workout', payload });
  }
}