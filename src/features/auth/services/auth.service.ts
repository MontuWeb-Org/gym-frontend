import { publicApi, authApi } from "@/lib/axios";
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
    const response = await publicApi.post("/auth/register/init", payload);
    return response.data;
  },

  async registerComplete(payload: RegisterCompletePayload): Promise<RegisterCompleteResponse> {
    const response = await publicApi.post("/auth/register/complete", payload);
    return response.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await publicApi.post("/auth/login", payload);
    return response.data;
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await publicApi.post("/auth/refresh", {}, { withCredentials: true });
    return response.data;
  },

  async forgotPasswordInit(payload: ForgotPasswordInitPayload): Promise<ForgotPasswordInitResponse> {
    const response = await publicApi.post("/auth/forgot/init", payload);
    return response.data;
  },

  async forgotPasswordComplete(payload: ForgotPasswordCompletePayload): Promise<AuthResponse> {
    const response = await publicApi.post("/auth/forgot/complete", payload);
    return response.data;
  },

  async logout(): Promise<void> {
    await publicApi.post("/auth/logout", {}, { withCredentials: true });
  },

  async getCurrentUser(): Promise<{ data: User }> {
    const response = await authApi.get<{ data: User }>("/users/me");
    return response.data;
  },

  async inviteTrainee(email: string): Promise<void> {
    await authApi.post("/invite/init", { email });
  }
};