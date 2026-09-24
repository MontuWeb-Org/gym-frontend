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
    const resolvedId = data.data.workoutLogId;
    await resolveId(sessionTempId, resolvedId);
    return resolvedId;
  }

  if (workoutLogId === null) return null;
  if (item.kind === 'log-exercise') {
    await authApi.post('/logs/exercises', { ...item.payload, workoutLogId });
  } else {
    await authApi.patch(`/logs/workouts/${workoutLogId}/complete`, item.payload);
  }
  return workoutLogId;
}