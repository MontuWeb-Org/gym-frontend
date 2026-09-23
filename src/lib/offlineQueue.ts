// src/lib/offlineQueue.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  StartWorkoutPayload,
  LogExercisePayload,
  CompleteWorkoutPayload,
} from '@/features/trainee/types/workoutLog.types';

type QueuedRequest =
  | { id: string; sessionTempId: string; kind: 'start-workout'; payload: StartWorkoutPayload; createdAt: number }
  | { id: string; sessionTempId: string; kind: 'log-exercise'; payload: LogExercisePayload; createdAt: number }
  | { id: string; sessionTempId: string; kind: 'complete-workout'; payload: CompleteWorkoutPayload; createdAt: number };

type NewQueuedRequest =
  | { sessionTempId: string; kind: 'start-workout'; payload: StartWorkoutPayload }
  | { sessionTempId: string; kind: 'log-exercise'; payload: LogExercisePayload }
  | { sessionTempId: string; kind: 'complete-workout'; payload: CompleteWorkoutPayload };

interface QueueDB extends DBSchema {
  requests: { key: string; value: QueuedRequest };
  idMap: { key: string; value: { tempId: string; realId: number } };
}

const dbPromise = openDB<QueueDB>('gym-offline-queue', 1, {
  upgrade(db: IDBPDatabase<QueueDB>) {
    db.createObjectStore('requests', { keyPath: 'id' });
    db.createObjectStore('idMap', { keyPath: 'tempId' });
  },
});

export async function enqueue(item: NewQueuedRequest) {
  const db = await dbPromise;
  const entry: QueuedRequest = { ...item, id: crypto.randomUUID(), createdAt: Date.now() };
  await db.add('requests', entry);
}

export async function getQueueForSession(sessionTempId: string): Promise<QueuedRequest[]> {
  const db = await dbPromise;
  const all = await db.getAll('requests');
  return all
    .filter((r: QueuedRequest) => r.sessionTempId === sessionTempId)
    .sort((a: QueuedRequest, b: QueuedRequest) => a.createdAt - b.createdAt);
}

export async function getAllSessionIds(): Promise<string[]> {
  const db = await dbPromise;
  const all = await db.getAll('requests');
  return Array.from(new Set(all.map((r: QueuedRequest) => r.sessionTempId)));
}

export async function removeFromQueue(id: string) {
  (await dbPromise).delete('requests', id);
}

export async function resolveId(tempId: string, realId: number) {
  (await dbPromise).put('idMap', { tempId, realId });
}

export async function getResolvedId(tempId: string): Promise<number | null> {
  const row = await (await dbPromise).get('idMap', tempId);
  return row ? row.realId : null;
}