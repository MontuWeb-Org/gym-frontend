export enum UserRole {
  ADMIN = "ADMIN",
  TRAINER = "TRAINER",
  TRAINEE = "TRAINEE",
}

export interface User {
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  bio?: string;
  experience?: string;
  role?: UserRole;
}