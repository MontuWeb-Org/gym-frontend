import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { programService } from "../services/program.service";

export interface PlanTemplate {
  id: number;
  name: string;
  description: string;
  status: "DRAFT" | "ACTIVE";
  durationWeekTemplates: number;
  isFav: boolean;
  weeks?: WeekTemplate[];
}

export interface WeekTemplate {
  id: number;
  name: string;
  sequenceNumber: number;
  durationMinutes: number;
  workoutTemplateCount: number;
  workouts?: WorkoutTemplate[];
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  sequenceNumber: number;
  weekTemplateId: number;
  durationMinutes: number;
  exerciseTemplateCount: number;
}

interface ProgramState {
  templates: PlanTemplate[];
  currentTemplate: PlanTemplate | null;
  currentWeek: WeekTemplate | null;
  currentWorkout: WorkoutTemplate | null;
  exercises: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProgramState = {
  templates: [],
  currentTemplate: null,
  currentWeek: null,
  currentWorkout: null,
  exercises: [],
  status: "idle",
  error: null,
};

export const fetchTemplates = createAsyncThunk(
  "trainerProgram/fetchTemplates",
  async () => {
    const response = await programService.getTemplates();
    return response.data.data.plans;
  }
);

export const createTemplate = createAsyncThunk(
  "trainerProgram/createTemplate",
  async (data: { name: string; description: string }) => {
    const response = await programService.createTemplate(data);
    return response.data.data; // returns planId
  }
);

export const fetchExercises = createAsyncThunk(
  "trainerProgram/fetchExercises",
  async () => {
    const response = await programService.getExercises();
    return response.data.data.exercises;
  }
);

export const programSlice = createSlice({
  name: "trainerProgram",
  initialState,
  reducers: {
    setCurrentTemplate(state, action: PayloadAction<PlanTemplate | null>) {
      state.currentTemplate = action.payload;
    },
    setCurrentWeek(state, action: PayloadAction<WeekTemplate | null>) {
      state.currentWeek = action.payload;
    },
    setCurrentWorkout(state, action: PayloadAction<WorkoutTemplate | null>) {
      state.currentWorkout = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.templates = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch templates";
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        // Optimistically add or let view handle redirection via returned planId
      })
      .addCase(fetchExercises.fulfilled, (state, action) => {
        state.exercises = action.payload;
      });
  },
});

export const { setCurrentTemplate, setCurrentWeek, setCurrentWorkout } = programSlice.actions;
export default programSlice.reducer;