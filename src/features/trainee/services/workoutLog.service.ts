// src/features/trainee/services/workoutLog.service.ts
import { authApi } from '@/lib/axios';
import { enqueue } from '@/lib/offlineQueue';
import { WorkoutSession, ExerciseLogDraft } from '../types/workoutLog.types';

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

  try {
    const { data } = await authApi.post('/api/logs/workouts', payload);
    return data.data.workoutLogId as number;
  } catch {
    await enqueue({ sessionTempId: session.tempId, kind: 'start-workout', payload });
    return null;
  }
}

export async function logExercise(
  sessionTempId: string,
  workoutLogId: number | null,
  exercise: ExerciseLogDraft
) {
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
    await authApi.post('/api/logs/exercises', payload);
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
  const payload = { endedAt, notes };

  if (workoutLogId === null || !navigator.onLine) {
    await enqueue({ sessionTempId, kind: 'complete-workout', payload });
    return;
  }

  try {
    await authApi.patch(`/api/logs/workouts/${workoutLogId}/complete`, payload);
  } catch {
    await enqueue({ sessionTempId, kind: 'complete-workout', payload });
  }
}