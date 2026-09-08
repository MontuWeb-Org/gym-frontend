import apiClient from "@/lib/axios";
import {
  RegisterInitPayload,
  RegisterInitResponse,
  RegisterCompletePayload,
  RegisterCompleteResponse,
  LoginPayload,
  AuthResponse,
  RefreshTokenResponse,
} from "../types/auth.types";

export const authService = {
  async registerInit(payload: RegisterInitPayload): Promise<RegisterInitResponse> {
    const response = await apiClient.post("/auth/register/init", payload);
    return response.data;
  },

  async registerComplete(payload: RegisterCompletePayload): Promise<RegisterCompleteResponse> {
    const response = await apiClient.post("/auth/register/complete", payload);
    return response.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/login", payload);
    return response.data;
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await apiClient.post("/auth/refresh");
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },
};