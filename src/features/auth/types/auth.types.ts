import { User } from "@/features/user/types/user.types";

export interface RegisterInitPayload {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface RegisterInitResponse {
  data: {
    creationToken: string;
  };
}

export interface RegisterCompletePayload {
  otp: string;
  creationToken: string;
}

export interface RegisterCompleteResponse {
  data: {
    accessToken: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordInitPayload {
  email: string;
}

export interface ForgotPasswordInitResponse {
  data: {
    verificationToken: string;
  };
}

export interface ForgotPasswordCompletePayload {
  otp: string;
  verificationToken: string;
  newPassword: string;
}

export interface AuthResponse {
  data: {
    accessToken: string;
  };
}

export interface RefreshTokenResponse {
  data: {
    accessToken: string;
  };

}
export interface GetCurrentUserResponse {
  data: User;
}

export type InviteStatus = "SETUP_PASSWORD" | "ACCEPT_INVITATION";

export interface InviteVerifyData {
  creationToken: string;
  trainerName: string;
  status: InviteStatus;
}

export interface InviteVerifyResponse {
  data: InviteVerifyData;
}

export interface InviteAcceptPayload {
  creationToken: string;
  accept: boolean;
}

export interface InviteAcceptResponse {
  data: {
    accessToken?: string;
  };
}

export interface InviteSetupPayload {
  creationToken: string;
  name: string;
  password: string;
}