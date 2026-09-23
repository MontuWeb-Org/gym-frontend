import { authApi } from "@/lib/axios";

import {
  GetTraineesQueryParams,
  GetTraineesResponse,
  TraineeDetailedInfo,
} from "../types/trainer.types";

import {
  TrainerDashboardResponse,
} from "../types/dashboard.types";
import { GetTraineeTimeline } from "../types/timeline.types";

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
        `/users/trainer/trainees/${traineeId}/performance`
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

  // Timeline
  async getTraineeTimeline(planAssignmentId: number): Promise<{ data: GetTraineeTimeline }> {
    const response = await authApi.get<{ data: GetTraineeTimeline }>(
      `/plans/assignments/${planAssignmentId}`
    );
    return response.data;
  },

  async startWorkout(planAssignmentId: number, workoutTemplateId: number): Promise<void> {
    await authApi.post(
      `/plans/assignments/${planAssignmentId}/workouts/${workoutTemplateId}/start`
    );
  },

  async skipWorkout(planAssignmentId: number, workoutTemplateId: number): Promise<void> {
    await authApi.post(
      `/plans/assignments/${planAssignmentId}/workouts/${workoutTemplateId}/skip`
    );
  },
};