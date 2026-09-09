import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { trainerService } from "../services/trainer.service";
import { Trainee, OffsetPagination, GetTraineesQueryParams } from "../types/trainer.types";

interface TraineesState {
  trainees: Trainee[];
  pagination: OffsetPagination | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TraineesState = {
  trainees: [],
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

const traineesSlice = createSlice({
  name: "trainees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export default traineesSlice.reducer;