import { authApi } from "@/lib/axios";
import { GetTraineesQueryParams, GetTraineesResponse } from "../types/trainer.types";

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
};