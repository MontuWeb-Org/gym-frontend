import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { trainerService } from "../services/trainer.service";
import {
  Trainee,
  TraineeDetailedInfo,
  OffsetPagination,
  GetTraineesQueryParams,
} from "../types/trainer.types";

interface TraineesState {
  trainees: Trainee[];
  selectedTrainee: TraineeDetailedInfo | null;
  pagination: OffsetPagination | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TraineesState = {
  trainees: [],
  selectedTrainee: null,
  pagination: null,
  isLoading: false,
  error: null,
};

export const fetchTrainerTrainees = createAsyncThunk(
  "trainees/fetchTrainerTrainees",
  async (params: GetTraineesQueryParams | undefined, { rejectWithValue }) => {
    try {
      return await trainerService.getTrainerTrainees(params);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch trainees list"
      );
    }
  }
);

export const fetchTraineeDetails = createAsyncThunk(
  "trainees/fetchTraineeDetails",
  async (traineeId: number, { rejectWithValue }) => {
    try {
      return await trainerService.getTraineeDetailedInfo(traineeId);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch trainee details"
      );
    }
  }
);

const traineesSlice = createSlice({
  name: "trainees",
  initialState,
  reducers: {
    clearSelectedTrainee: (state) => {
      state.selectedTrainee = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchTrainerTrainees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrainerTrainees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trainees = action.payload.data.trainees;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTrainerTrainees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "An error occurred";
      })

      // Fetch Details
      .addCase(fetchTraineeDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTraineeDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTrainee = action.payload.data;
      })
      .addCase(fetchTraineeDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "An error occurred";
      });
  },
});

export const { clearSelectedTrainee } = traineesSlice.actions;
export default traineesSlice.reducer;