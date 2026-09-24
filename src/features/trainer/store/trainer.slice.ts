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
  async (
    params: GetTraineesQueryParams | undefined,
    { rejectWithValue }
  ) => {
    try {
      return await trainerService.getTrainerTrainees(params);
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
          "Failed to fetch trainees list"
      );
    }
  }
);

export const fetchTraineeDetails = createAsyncThunk(
  "trainees/fetchTraineeDetails",
  async (
    traineeId: number,
    { rejectWithValue }
  ) => {
    try {
      return await trainerService.getTraineeDetailedInfo(
        traineeId
      );
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
          "Failed to fetch trainee details"
      );
    }
  }
);

export const deleteTrainee = createAsyncThunk(
  "trainees/deleteTrainee",
  async (
    traineeId: number,
    { rejectWithValue }
  ) => {
    try {
      await trainerService.DeleteTrainee(traineeId);

      return traineeId;
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
          "Failed to delete trainee"
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

      .addCase(
        fetchTrainerTrainees.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchTrainerTrainees.fulfilled,
        (state, action) => {
          state.isLoading = false;

          /*
           * Backend response:
           *
           * data: [
           *   {
           *     traineeId,
           *     traineeName,
           *     traineeStatus,
           *     plans: [...]
           *   }
           * ]
           *
           * Keep both:
           * 1. The original API fields used directly by the
           *    trainee-management components.
           * 2. The existing normalized fields used elsewhere
           *    in the trainer feature.
           */
          state.trainees = action.payload.data.map(
            (trainee) => {
              const activePlan = trainee.plans?.[0];

              return {
                // API fields
                traineeId: trainee.traineeId,
                traineeName: trainee.traineeName,
                traineeStatus: trainee.traineeStatus,
                plans: trainee.plans ?? [],
                email: trainee.email,

                // Existing normalized fields
                id: trainee.traineeId,
                name: trainee.traineeName,
                status: trainee.traineeStatus,
                adherence:
                  activePlan?.adherencePercentage ?? 0,
                programName:
                  activePlan?.template?.templateName ?? "",
                lastSessionDate:
                  activePlan?.lastSession?.startedAt ?? null,

                assignedPlanTemplateIds:
                  trainee.plans?.map(
                    (plan) =>
                      plan.template.templateId
                  ) ?? [],
              };
            }
          );

          /*
           * Backend uses `totalItems`.
           * Frontend state uses `total`.
           */
          state.pagination = {
            total:
              action.payload.pagination.totalItems,
            page:
              action.payload.pagination.page,
            limit:
              action.payload.pagination.limit,
            totalPages:
              action.payload.pagination.totalPages,
          };
        }
      )

      .addCase(
        fetchTrainerTrainees.rejected,
        (state, action) => {
          state.isLoading = false;

          state.error =
            (action.payload as string) ||
            "An error occurred";
        }
      )

      .addCase(
        fetchTraineeDetails.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchTraineeDetails.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.selectedTrainee =
            action.payload.data;
        }
      )

      .addCase(
        fetchTraineeDetails.rejected,
        (state, action) => {
          state.isLoading = false;

          state.error =
            (action.payload as string) ||
            "An error occurred";
        }
      )

      .addCase(
        deleteTrainee.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )

      .addCase(
        deleteTrainee.fulfilled,
        (state, action) => {
          state.isLoading = false;

          state.trainees =
            state.trainees.filter(
              (trainee) =>
                trainee.id !== action.meta.arg
            );
        }
      )

      .addCase(
        deleteTrainee.rejected,
        (state, action) => {
          state.isLoading = false;

          state.error =
            (action.payload as string) ||
            "An error occurred";
        }
      );
  },
});

export const {
  clearSelectedTrainee,
} = traineesSlice.actions;

export default traineesSlice.reducer;