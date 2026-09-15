import { authApi } from "@/lib/axios";
import { UpdateProfilePayload } from "@/features/user/types/user.types";

export const userService = {
  async updateProfile(payload: UpdateProfilePayload) {
    const response = await authApi.put<{ message: string }>("/users/me", payload);
    return response.data;
  },
};