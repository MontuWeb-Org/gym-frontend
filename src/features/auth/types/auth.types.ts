export enum UserRole {
  ADMIN = "ADMIN",
  TRAINER = "TRAINER",
  TRAINEE = "TRAINEE",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

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
  identifier: string;
  password: string;
}

export interface AuthResponse {
  data: {
    accessToken: string;
  };
}