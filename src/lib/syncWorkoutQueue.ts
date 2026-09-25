// src/lib/syncWorkoutQueue.ts
import { authApi } from '@/lib/axios';
import {
  getAllSessionIds,
  getQueueForSession,
  removeFromQueue,
  resolveId,
  getResolvedId,
} from './offlineQueue';

let syncPromise: Promise<void> | null = null;

interface StartWorkoutResponse {
  data: { workoutLogId: number };
}

function numericWorkoutLogId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (!value || typeof value !== 'object') return null;
  const object = value as Record<string, unknown>;
  for (const key of ['workoutLogId', 'id', 'data', 'workoutLog']) {
    const id = numericWorkoutLogId(object[key]);
    if (id !== null) return id;
  }
  return null;
}

export async function syncWorkoutQueue() {
  if (syncPromise) return syncPromise;

  syncPromise = syncQueue().finally(() => {
    syncPromise = null;
  });
  return syncPromise;
}

async function syncQueue() {
  const sessionIds = await getAllSessionIds();

  for (const sessionTempId of sessionIds) {
    let workoutLogId = await getResolvedId(sessionTempId);

    while (true) {
      const [item] = await getQueueForSession(sessionTempId);
      if (!item) break;

      try {
        const resolvedWorkoutLogId = await processQueueItem(item, sessionTempId, workoutLogId);
        if (resolvedWorkoutLogId === null && item.kind !== 'start-workout') break;
        workoutLogId = resolvedWorkoutLogId;
        await removeFromQueue(item.id);
      } catch {
        break;
      }
    }
  }
}

async function processQueueItem(
  item: Awaited<ReturnType<typeof getQueueForSession>>[number],
  sessionTempId: string,
  workoutLogId: number | null
): Promise<number | null> {
  if (item.kind === 'start-workout') {
    const { data } = await authApi.post<StartWorkoutResponse>('/logs/workouts', item.payload);
    const resolvedId = numericWorkoutLogId(data);
    if (resolvedId === null) {
      throw new Error('Queued start workout response did not contain a numeric ID');
    }
    await resolveId(sessionTempId, resolvedId);
    return resolvedId;
  }

  if (workoutLogId === null) return null;
  if (item.kind === 'log-exercise') {
        await authApi.post('/logs/exercises', {
          ...item.payload,
          workoutLogId,
        });
  } else {
    await authApi.patch(`/logs/workouts/${workoutLogId}/complete`, item.payload);
  }
  return workoutLogId;
}