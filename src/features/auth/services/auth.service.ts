import apiClient from "@/lib/axios";
import {
  RegisterInitPayload,
  RegisterInitResponse,
  RegisterCompletePayload,
  RegisterCompleteResponse,
  LoginPayload,
  AuthResponse,
  RefreshTokenResponse,
  ForgotPasswordInitPayload,
  ForgotPasswordInitResponse,
  ForgotPasswordCompletePayload,
} from "../types/auth.types";
import { User } from "@/types/user.types";

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

  async forgotPasswordInit(payload: ForgotPasswordInitPayload): Promise<ForgotPasswordInitResponse> {
    const response = await apiClient.post("/auth/forgot/init", payload);
    return response.data;
  },

  async forgotPasswordComplete(payload: ForgotPasswordCompletePayload): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/forgot/complete", payload);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async getCurrentUser(token?: string): Promise<{ data: User }> {
    const response = await apiClient.get<{ data: User }>("/users/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },
};