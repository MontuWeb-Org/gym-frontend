import { authApi } from "@/lib/axios";

import {
  GetTraineesQueryParams,
  GetTraineesResponse,
  TraineeDetailedInfo,
} from "../types/trainer.types";

import {
  TrainerDashboardResponse,
} from "../types/dashboard.types";

export const trainerService = {
  async getTrainerTrainees(
    params?: GetTraineesQueryParams
  ): Promise<GetTraineesResponse> {
    const response =
      await authApi.get<GetTraineesResponse>(
        "/users/trainer/trainees",
        {
          params: {
            status: params?.status,
            search: params?.search,
            pageNumber: params?.pageNumber ?? 1,
            pageSize: params?.pageSize ?? 10,
            sortBy: params?.sortBy ?? "createdAt",
            sortOrder: params?.sortOrder ?? "desc",
          },
        }
      );

    return response.data;
  },

  async getAtRiskTrainees(): Promise<GetTraineesResponse> {
    const response =
      await authApi.get<GetTraineesResponse>(
        "/users/trainer/trainees",
        {
          params: {
            status: "AT_RISK",
            pageNumber: 1,
            pageSize: 10,
            sortBy: "createdAt",
            sortOrder: "desc",
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
        `/users/trainer/trainees/${traineeId}`
      );

    return response.data;
  },

  async DeleteTrainee(
    traineeId: number
  ): Promise<void> {
    await authApi.delete(
      `/users/trainer/trainees/${traineeId}`
    );
  },

  async getTrainerDashboard(): Promise<TrainerDashboardResponse> {
    const response =
      await authApi.get<{
        data: TrainerDashboardResponse;
      }>(
        "/users/trainer/dashboard"
      );

    return response.data.data;
  },
};