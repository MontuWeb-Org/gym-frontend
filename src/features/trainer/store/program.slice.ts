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

export interface ExerciseItem {
  id: number;
  name: string;
  difficulty: string;
  equipment: string[];
  instructions: string;
  illustrations: string[];
}

interface ProgramState {
  templates: PlanTemplate[];
  currentTemplate: PlanTemplate | null;
  currentWeek: WeekTemplate | null;
  currentWorkout: WorkoutTemplate | null;
  exercises: ExerciseItem[];
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
    return response.data.data;
  }
);

export const fetchExercises = createAsyncThunk(
  "trainerProgram/fetchExercises",
  async () => {
    const response = await programService.getExercises();
    return response.data.data.exercises;
  }
);

// Publish a template (updates status to ACTIVE)
export const publishTemplate = createAsyncThunk(
  "trainerProgram/publishTemplate",
  async (planId: number) => {
    const response = await programService.updatePlanTemplate(planId, { status: "ACTIVE" });
    return response.data.data;
  }
);

// Assign a plan to a trainee
export const assignPlanToTrainee = createAsyncThunk(
  "trainerProgram/assignPlanToTrainee",
  async (data: { planTemplateId: number; traineeId: number; createdAt: string; endedAt: string }) => {
    const response = await programService.assignPlan(data);
    return response.data.data;
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
      .addCase(createTemplate.fulfilled, () => {
        // Handled via component redirection and storage sync
      })
      .addCase(fetchExercises.fulfilled, (state, action) => {
        state.exercises = action.payload;
      })
      .addCase(publishTemplate.fulfilled, (state, action) => {
        // Update local template status if it exists in state
        const updatedPlan = action.payload;
        if (state.currentTemplate && state.currentTemplate.id === updatedPlan?.planId) {
          state.currentTemplate.status = "ACTIVE";
        }
      });
  },
});

export const { setCurrentTemplate, setCurrentWeek, setCurrentWorkout } = programSlice.actions;
export default programSlice.reducer;