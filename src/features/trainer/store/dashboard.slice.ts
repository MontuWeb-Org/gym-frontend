import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { trainerService } from "../services/trainer.service";

import {
  GetTraineesApiItem,
} from "../types/trainer.types";

import {
  TrainerDashboardResponse,
} from "../types/dashboard.types";

interface DashboardState {
  dashboard: TrainerDashboardResponse | null;

  atRiskTrainees: GetTraineesApiItem[];

  isLoading: boolean;
  isAtRiskLoading: boolean;

  error: string | null;
  atRiskError: string | null;
}

const initialState: DashboardState = {
  dashboard: null,

  atRiskTrainees: [],

  isLoading: false,
  isAtRiskLoading: false,

  error: null,
  atRiskError: null,
};

export const fetchTrainerDashboard = createAsyncThunk(
  "dashboard/fetchTrainerDashboard",
  async (_, { rejectWithValue }) => {
    try {
      return await trainerService.getTrainerDashboard();
    } catch (err) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch dashboard"
      );
    }
  }
);

export const fetchAtRiskTrainees = createAsyncThunk(
  "dashboard/fetchAtRiskTrainees",
  async (_, { rejectWithValue }) => {
    try {
      const response =
        await trainerService.getAtRiskTrainees();

      return response.data;
    } catch (err) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch at-risk trainees"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",

  initialState,

  reducers: {
    clearDashboard: (state) => {
      state.dashboard = null;
      state.atRiskTrainees = [];
      state.error = null;
      state.atRiskError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Dashboard summary
      .addCase(
        fetchTrainerDashboard.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchTrainerDashboard.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.dashboard = action.payload;
        }
      )

      .addCase(
        fetchTrainerDashboard.rejected,
        (state, action) => {
          state.isLoading = false;

          state.error =
            (action.payload as string) ||
            "Failed to fetch dashboard";
        }
      )

      // At-risk trainees
      .addCase(
        fetchAtRiskTrainees.pending,
        (state) => {
          state.isAtRiskLoading = true;
          state.atRiskError = null;
        }
      )

      .addCase(
        fetchAtRiskTrainees.fulfilled,
        (state, action) => {
          state.isAtRiskLoading = false;
          state.atRiskTrainees = action.payload;
        }
      )

      .addCase(
        fetchAtRiskTrainees.rejected,
        (state, action) => {
          state.isAtRiskLoading = false;

          state.atRiskError =
            (action.payload as string) ||
            "Failed to fetch at-risk trainees";
        }
      );
  },
});

export const {
  clearDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;