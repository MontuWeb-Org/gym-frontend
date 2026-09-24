import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { trainerService } from "../services/trainer.service";
import { GetTraineeTimeline, WorkoutLogStatus } from "../types/timeline.types";

interface TimelineState {
  data: GetTraineeTimeline | null;
  planAssignmentId: number | null;
  isLoading: boolean;
  error: string | null;
  // Tracks workouts that have been locally re-started (skipped → in_progress for UI)
  reStartedWorkoutIds: number[];
}

const initialState: TimelineState = {
  data: null,
  planAssignmentId: null,
  isLoading: false,
  error: null,
  reStartedWorkoutIds: [],
};

export const fetchTimeline = createAsyncThunk(
  "timeline/fetchTimeline",
  async (planAssignmentId: number, { rejectWithValue }) => {
    try {
      const res = await trainerService.getTraineeTimeline(planAssignmentId);
      return { data: res.data, planAssignmentId };
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch plan timeline"
      );
    }
  }
);

export const startWorkout = createAsyncThunk(
  "timeline/startWorkout",
  async (
    { planAssignmentId, workoutTemplateId }: { planAssignmentId: number; workoutTemplateId: number },
    { rejectWithValue }
  ) => {
    try {
      await trainerService.startWorkout(planAssignmentId, workoutTemplateId);
      return { workoutTemplateId };
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to start workout"
      );
    }
  }
);

export const skipWorkout = createAsyncThunk(
  "timeline/skipWorkout",
  async (
    { planAssignmentId, workoutTemplateId }: { planAssignmentId: number; workoutTemplateId: number },
    { rejectWithValue }
  ) => {
    try {
      await trainerService.skipWorkout(planAssignmentId, workoutTemplateId);
      return { workoutTemplateId };
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to skip workout"
      );
    }
  }
);

// Helper: update a workout's log status inside nested state
function updateWorkoutLogStatus(
  state: TimelineState,
  workoutTemplateId: number,
  status: WorkoutLogStatus
) {
  if (!state.data) return;
  for (const week of state.data.planTemplate.weekTemplates) {
    const workout = week.workouts.find((w) => w.id === workoutTemplateId);
    if (workout) {
      if (workout.workoutLog) {
        workout.workoutLog.status = status;
      } else {
        workout.workoutLog = {
          id: Date.now(), // optimistic fake id
          workoutTemplateId,
          durationMinutes: 0,
          status,
        };
      }
      break;
    }
  }
}

const timelineSlice = createSlice({
  name: "timeline",
  initialState,
  reducers: {
    clearTimeline: (state) => {
      state.data = null;
      state.planAssignmentId = null;
      state.error = null;
      state.reStartedWorkoutIds = [];
    },
    addReStartedWorkout: (state, action: PayloadAction<number>) => {
      if (!state.reStartedWorkoutIds.includes(action.payload)) {
        state.reStartedWorkoutIds.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Timeline
      .addCase(fetchTimeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimeline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.data;
        state.planAssignmentId = action.payload.planAssignmentId;
      })
      .addCase(fetchTimeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "An error occurred";
      })

      // Start Workout (optimistic UI update)
      .addCase(startWorkout.fulfilled, (state, action) => {
        updateWorkoutLogStatus(state, action.payload.workoutTemplateId, "in_progress");
        // Also track it as a re-started workout if it was skipped
        if (!state.reStartedWorkoutIds.includes(action.payload.workoutTemplateId)) {
          state.reStartedWorkoutIds.push(action.payload.workoutTemplateId);
        }
      })

      // Skip Workout (optimistic UI update)
      .addCase(skipWorkout.fulfilled, (state, action) => {
        updateWorkoutLogStatus(state, action.payload.workoutTemplateId, "skipped");
        // Remove from re-started list if it was there
        state.reStartedWorkoutIds = state.reStartedWorkoutIds.filter(
          (id) => id !== action.payload.workoutTemplateId
        );
      });
  },
});

export const { clearTimeline, addReStartedWorkout } = timelineSlice.actions;
export default timelineSlice.reducer;
