import { authApi } from "@/lib/axios";
import { GetTraineesQueryParams, GetTraineesResponse, TraineeDetailedInfo } from "../types/trainer.types";

export const trainerService = {
  async getTrainerTrainees(params?: GetTraineesQueryParams): Promise<GetTraineesResponse> {
    const response = await authApi.get<GetTraineesResponse>("/users/trainer/trainees", {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });
    return response.data;
  },
  async getTraineeDetailedInfo(traineeId: number): Promise<{ data: TraineeDetailedInfo }> {
    const response = await authApi.get<{ data: TraineeDetailedInfo }>(
      `/users/trainer/trainees/${traineeId}`
    );
    return response.data;
  }
};