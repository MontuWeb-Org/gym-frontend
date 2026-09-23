import { authApi } from "@/lib/axios";
import {
  UpdateProfilePayload,
  User,
} from "@/features/user/types/user.types";

export const userService = {
  async getCurrentUser(): Promise<{ data: User }> {
    const response = await authApi.get<{ data: User }>("/api/users/me");
    return response.data;
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const response = await authApi.put<{ message: string }>(
      "/api/users/me",
      payload
    );
    return response.data;
  },
};