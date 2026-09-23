// src/lib/syncWorkoutQueue.ts
import { authApi } from '@/lib/axios';
import {
  getAllSessionIds,
  getQueueForSession,
  removeFromQueue,
  resolveId,
  getResolvedId,
} from './offlineQueue';

interface StartWorkoutResponse {
  data: { workoutLogId: number };
}

export async function syncWorkoutQueue() {
  const sessionIds = await getAllSessionIds();

  for (const sessionTempId of sessionIds) {
    const items = await getQueueForSession(sessionTempId);
    let workoutLogId = await getResolvedId(sessionTempId);

    for (const item of items) {
      try {
        if (item.kind === 'start-workout') {
          const { data } = await authApi.post<StartWorkoutResponse>('/api/logs/workouts', item.payload);
          workoutLogId = data.data.workoutLogId; // now a real number, no reset-to-declared-type issue
          await resolveId(sessionTempId, workoutLogId);
        } else if (item.kind === 'log-exercise') {
          if (workoutLogId === null) break;
          await authApi.post('/api/logs/exercises', { ...item.payload, workoutLogId });
        } else if (item.kind === 'complete-workout') {
          if (workoutLogId === null) break;
          await authApi.patch(`/api/logs/workouts/${workoutLogId}/complete`, item.payload);
        }
        await removeFromQueue(item.id);
      } catch {
        break;
      }
    }
  }
}