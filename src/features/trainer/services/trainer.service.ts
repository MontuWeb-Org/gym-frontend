import { authApi } from "@/lib/axios";

import {
  GetTraineesQueryParams,
  GetTraineesResponse,
  TraineeDetailedInfo,
} from "../types/trainer.types";

export const trainerService = {
  async getTrainerTrainees(
    params?: GetTraineesQueryParams
  ): Promise<GetTraineesResponse> {
    const response =
      await authApi.get<GetTraineesResponse>(
        "/api/users/trainer/trainees",
        {
          params: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 10,
          },
        }
      );

    return response.data;
  },

  async getTraineeDetailedInfo(
    traineeId: number
  ): Promise<{
    data: TraineeDetailedInfo;
  }> {
    const response =
      await authApi.get<{
        data: TraineeDetailedInfo;
      }>(
        `/api/users/trainer/trainees/${traineeId}`
      );

    return response.data;
  },

  async DeleteTrainee(
    traineeId: number
  ): Promise<void> {
    await authApi.delete(
      `/api/users/trainer/trainees/${traineeId}`
    );
  },
};