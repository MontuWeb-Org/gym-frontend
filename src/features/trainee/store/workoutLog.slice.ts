import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CompleteWorkoutPayload,
  LogExercisePayload,
  SetLogDraft,
  StartWorkoutPayload,
  WorkoutSession,
} from "../types/workoutLog.types";

export type WorkoutLogStatus = "idle" | "active" | "completed";
export type RestTimerStatus = "idle" | "running" | "paused" | "completed";

export interface WorkoutExerciseInput {
  workoutExerciseTemplateId: number;
  sequenceNumber: number;
  recommendedRestSeconds: number;
  setCount: number;
}

export type WorkoutOfflineOperation =
  | { kind: "start-workout"; payload: StartWorkoutPayload }
  | { kind: "log-exercise"; payload: LogExercisePayload }
  | { kind: "complete-workout"; payload: CompleteWorkoutPayload };

export type PendingWorkoutOperation = WorkoutOfflineOperation & {
  id: string;
  queuedAt: string;
};

export interface RestTimerState {
  status: RestTimerStatus;
  recommendedSeconds: number;
  startedAt: string | null;
  pausedAt: string | null;
  elapsedSeconds: number;
}

export interface WorkoutLogState {
  status: WorkoutLogStatus;
  session: WorkoutSession | null;
  exercises: WorkoutExerciseInput[];
  activeExerciseIndex: number;
  activeSetIndex: number;
  timer: RestTimerState;
  offlineBuffer: PendingWorkoutOperation[];
}

const initialTimer: RestTimerState = {
  status: "idle",
  recommendedSeconds: 0,
  startedAt: null,
  pausedAt: null,
  elapsedSeconds: 0,
};

const initialState: WorkoutLogState = {
  status: "idle",
  session: null,
  exercises: [],
  activeExerciseIndex: 0,
  activeSetIndex: 0,
  timer: initialTimer,
  offlineBuffer: [],
};

const workoutLogSlice = createSlice({
  name: "workoutLog",
  initialState,
  reducers: {
    startWorkoutSession: (
      state,
      action: PayloadAction<{
        session: WorkoutSession;
        exercises: WorkoutExerciseInput[];
      }>
    ) => {
      state.status = "active";
      state.session = action.payload.session;
      state.exercises = action.payload.exercises;
      state.activeExerciseIndex = 0;
      state.activeSetIndex = 0;
      state.timer = initialTimer;
    },
    updateSet: (
      state,
      action: PayloadAction<{
        exerciseIndex: number;
        setIndex: number;
        values: Partial<SetLogDraft>;
      }>
    ) => {
      const exercise = state.session?.exercises[action.payload.exerciseIndex];
      const set = exercise?.sets[action.payload.setIndex];
      if (set) Object.assign(set, action.payload.values);
    },
    setActiveSet: (
      state,
      action: PayloadAction<{ exerciseIndex: number; setIndex: number }>
    ) => {
      state.activeExerciseIndex = action.payload.exerciseIndex;
      state.activeSetIndex = action.payload.setIndex;
    },
    startRestTimer: (
      state,
      action: PayloadAction<{ recommendedSeconds: number; startedAt?: string }>
    ) => {
      state.timer = {
        status: "running",
        recommendedSeconds: Math.max(0, action.payload.recommendedSeconds),
        startedAt: action.payload.startedAt ?? new Date().toISOString(),
        pausedAt: null,
        elapsedSeconds: 0,
      };
    },
    pauseRestTimer: (state, action: PayloadAction<{ pausedAt?: string }>) => {
      if (state.timer.status === "running") {
        state.timer.status = "paused";
        state.timer.pausedAt = action.payload.pausedAt ?? new Date().toISOString();
      }
    },
    resumeRestTimer: (state, action: PayloadAction<{ resumedAt?: string }>) => {
      if (state.timer.status === "paused") {
        state.timer.status = "running";
        state.timer.pausedAt = null;
        const resumedAt = action.payload.resumedAt
          ? new Date(action.payload.resumedAt).getTime()
          : Date.now();
        state.timer.startedAt = new Date(
          resumedAt - state.timer.elapsedSeconds * 1000
        ).toISOString();
      }
    },
    updateRestTimer: (state, action: PayloadAction<{ elapsedSeconds: number }>) => {
      if (state.timer.status === "running" || state.timer.status === "paused") {
        state.timer.elapsedSeconds = Math.max(0, action.payload.elapsedSeconds);
      }
    },
    resetRestTimer: (state) => {
      state.timer = initialTimer;
    },
    bufferOfflineOperation: (
      state,
      action: PayloadAction<PendingWorkoutOperation>
    ) => {
      state.offlineBuffer.push(action.payload);
    },
    removeBufferedOperation: (state, action: PayloadAction<string>) => {
      state.offlineBuffer = state.offlineBuffer.filter(
        (operation) => operation.id !== action.payload
      );
    },
    completeWorkoutSession: (state, action: PayloadAction<{ endedAt: string }>) => {
      if (state.session) {
        state.session.endedAt = action.payload.endedAt;
        state.session.status = "completed";
      }
      state.status = "completed";
      state.timer = initialTimer;
    },
    clearWorkoutSession: () => initialState,
  },
});

export const {
  startWorkoutSession,
  updateSet,
  setActiveSet,
  startRestTimer,
  pauseRestTimer,
  resumeRestTimer,
  updateRestTimer,
  resetRestTimer,
  bufferOfflineOperation,
  removeBufferedOperation,
  completeWorkoutSession,
  clearWorkoutSession,
} = workoutLogSlice.actions;

export default workoutLogSlice.reducer;