import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import { programService } from "../services/program.service";

export interface PlanTemplate {
  id: number;
  name: string;
  description: string;
  status: "DRAFT" | "ACTIVE";
  trainerId?: number;
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
  status:
    | "idle"
    | "loading"
    | "succeeded"
    | "failed";
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

// -----------------------------------------------------------------------------
// Fetch Templates
// -----------------------------------------------------------------------------

export const fetchTemplates =
  createAsyncThunk(
    "trainerProgram/fetchTemplates",
    async (
      _,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await programService.getTemplates();

        return response.data;
      } catch (err: unknown) {
        if (
          axios.isAxiosError(err)
        ) {
          return rejectWithValue(
            err.response?.data?.message ||
              "Failed to fetch templates"
          );
        }

        return rejectWithValue(
          "Failed to fetch templates"
        );
      }
    }
  );

// -----------------------------------------------------------------------------
// Create Template
// -----------------------------------------------------------------------------

export const createTemplate =
  createAsyncThunk(
    "trainerProgram/createTemplate",
    async (
      data: {
        name: string;
        description: string;
      },
      { rejectWithValue }
    ) => {
      try {
        const response =
          await programService.createTemplate(
            data
          );

        return response.data;
      } catch (err: unknown) {
        if (
          axios.isAxiosError(err)
        ) {
          const responseData =
            err.response?.data;

          // Keep the useful backend validation
          // message instead of hiding it.
          if (
            responseData?.message
          ) {
            return rejectWithValue(
              responseData.message
            );
          }

          return rejectWithValue(
            "Failed to create template"
          );
        }

        return rejectWithValue(
          "Failed to create template"
        );
      }
    }
  );

// -----------------------------------------------------------------------------
// Fetch Exercises
// -----------------------------------------------------------------------------

export const fetchExercises =
  createAsyncThunk(
    "trainerProgram/fetchExercises",
    async (
      _,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await programService.getExercises();

        return response.data;
      } catch (err: unknown) {
        if (
          axios.isAxiosError(err)
        ) {
          return rejectWithValue(
            err.response?.data?.message ||
              "Failed to fetch exercises"
          );
        }

        return rejectWithValue(
          "Failed to fetch exercises"
        );
      }
    }
  );

export const programSlice =
  createSlice({
    name: "trainerProgram",
    initialState,

    reducers: {
      setCurrentTemplate(
        state,
        action: PayloadAction<
          PlanTemplate | null
        >
      ) {
        state.currentTemplate =
          action.payload;
      },

      setCurrentWeek(
        state,
        action: PayloadAction<
          WeekTemplate | null
        >
      ) {
        state.currentWeek =
          action.payload;
      },

      setCurrentWorkout(
        state,
        action: PayloadAction<
          WorkoutTemplate | null
        >
      ) {
        state.currentWorkout =
          action.payload;
      },

      upsertTemplate(
        state,
        action: PayloadAction<PlanTemplate>
      ) {
        const index =
          state.templates.findIndex(
            (t) =>
              t.id ===
              action.payload.id
          );

        if (index !== -1) {
          state.templates[index] = {
            ...state.templates[index],
            ...action.payload,
          };
        } else {
          state.templates.unshift(
            action.payload
          );
        }
      },
    },

    extraReducers: (builder) => {
      builder

        // ---------------------------------------------------------------------
        // Fetch Templates
        // ---------------------------------------------------------------------

        .addCase(
          fetchTemplates.pending,
          (state) => {
            state.status =
              "loading";

            state.error = null;
          }
        )

        .addCase(
          fetchTemplates.fulfilled,
          (
            state,
            action
          ) => {
            state.status =
              "succeeded";

            const payload =
              action.payload;

            const plansList =
              payload?.data?.plans ||
              payload?.plans ||
              payload?.data ||
              (Array.isArray(
                payload
              )
                ? payload
                : []);

            state.templates =
              Array.isArray(
                plansList
              )
                ? plansList
                : [];
          }
        )

        .addCase(
          fetchTemplates.rejected,
          (
            state,
            action
          ) => {
            state.status =
              "failed";

            state.error =
              (action.payload as string) ||
              "Failed to fetch templates";
          }
        )

        // ---------------------------------------------------------------------
        // Create Template
        // ---------------------------------------------------------------------

        .addCase(
          createTemplate.pending,
          (state) => {
            state.status =
              "loading";

            state.error = null;
          }
        )

        .addCase(
          createTemplate.fulfilled,
          (
            state,
            action
          ) => {
            state.status =
              "succeeded";

            state.error = null;

            const payload =
              action.payload;

            const newTemplate =
              payload?.data ||
              payload;

            if (newTemplate) {
              const formattedTemplate: PlanTemplate =
                {
                  id:
                    newTemplate.id ||
                    newTemplate.planId ||
                    Date.now(),

                  name:
                    newTemplate.name,

                  description:
                    newTemplate.description ||
                    "",

                  status:
                    newTemplate.status ||
                    "DRAFT",

                  trainerId:
                    newTemplate.trainerId,

                  durationWeekTemplates:
                    newTemplate.durationWeekTemplates ||
                    4,

                  isFav:
                    newTemplate.isFav ||
                    false,

                  weeks:
                    newTemplate.weeks ||
                    [],
                };

              if (
                !state.templates.some(
                  (t) =>
                    t.id ===
                    formattedTemplate.id
                )
              ) {
                state.templates.unshift(
                  formattedTemplate
                );
              }
            }
          }
        )

        .addCase(
          createTemplate.rejected,
          (
            state,
            action
          ) => {
            state.status =
              "failed";

            state.error =
              (action.payload as string) ||
              "Failed to create template";
          }
        )

        // ---------------------------------------------------------------------
        // Fetch Exercises
        // ---------------------------------------------------------------------

        .addCase(
          fetchExercises.fulfilled,
          (
            state,
            action
          ) => {
            const payload =
              action.payload;

            const exercisesList =
              payload?.data
                ?.exercises ||
              payload?.exercises ||
              payload?.data ||
              (Array.isArray(
                payload
              )
                ? payload
                : []);

            state.exercises =
              Array.isArray(
                exercisesList
              )
                ? exercisesList
                : [];
          }
        );
    },
  });

export const {
  setCurrentTemplate,
  setCurrentWeek,
  setCurrentWorkout,
  upsertTemplate,
} =
  programSlice.actions;

export default programSlice.reducer;