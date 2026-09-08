import { User } from "@/types/user.types";

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