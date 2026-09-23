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
  InviteVerifyResponse,
  InviteAcceptPayload,
  InviteAcceptResponse,
  InviteSetupPayload,
} from "../types/auth.types";

export const authService = {
  async registerInit(
    payload: RegisterInitPayload
  ): Promise<RegisterInitResponse> {
    const response = await publicApi.post(
      "/api/auth/register/init",
      payload
    );
    return response.data;
  },

  async registerComplete(
    payload: RegisterCompletePayload
  ): Promise<RegisterCompleteResponse> {
    const response = await authApi.post(
      "/api/auth/register/complete",
      payload
    );
    return response.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await authApi.post("/api/auth/login", payload);
    return response.data;
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await authApi.post("/api/auth/refresh-token", {});
    return response.data;
  },

  async forgotPasswordInit(
    payload: ForgotPasswordInitPayload
  ): Promise<ForgotPasswordInitResponse> {
    const response = await publicApi.post(
      "/api/auth/forgot/init",
      payload
    );
    return response.data;
  },

  async forgotPasswordComplete(
    payload: ForgotPasswordCompletePayload
  ): Promise<AuthResponse> {
    const response = await authApi.post(
      "/api/auth/forgot/complete",
      payload
    );
    return response.data;
  },

  async logout(): Promise<void> {
    await authApi.post("/api/auth/logout", {});
  },

  async inviteTrainee(email: string): Promise<void> {
    await authApi.post("/api/auth/invite/init", { email });
  },

  async inviteVerify(token: string): Promise<InviteVerifyResponse> {
    const response = await publicApi.get(
      `/api/auth/invite/verify/${token}`
    );
    return response.data;
  },

  async inviteAccept(
    payload: InviteAcceptPayload
  ): Promise<InviteAcceptResponse> {
    const response = await publicApi.post(
      "/api/auth/invite/accept",
      payload
    );
    return response.data;
  },

  async inviteSetup(
    payload: InviteSetupPayload
  ): Promise<AuthResponse> {
    const response = await publicApi.post(
      "/api/auth/invite/setup",
      payload
    );
    return response.data;
  },
};