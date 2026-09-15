export enum UserRole {
  ADMIN = "ADMIN",
  TRAINER = "TRAINER",
  TRAINEE = "TRAINEE",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum ActivationStatus {
  ACTIVATED = "ACTIVATED",
  PENDING = "PENDING",
}

export interface BodyMetrics {
  weightKg?: number;
  heightCm?: number;
  targetWeightKg?: number;
}

export interface BaseUserEntity {
  id: number;
  phoneNumber: string;
  email: string;
  name: string;
  role: UserRole;
  status: ActivationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerProfileEntity {
  userId: number;
  experience?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TraineeProfileEntity {
  userId: number;
  gender: Gender;
  birthDate: string;
  bodyMetrics: BodyMetrics;
  trainerId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerUser extends BaseUserEntity {
  role: UserRole.TRAINER;
  trainerProfile?: TrainerProfileEntity;
  experience?: string | null;
  bio?: string | null;
}

export interface TraineeUser extends BaseUserEntity {
  role: UserRole.TRAINEE;
  traineeProfile?: TraineeProfileEntity;
  gender?: Gender;
  birthDate?: string;
  bodyMetrics?: BodyMetrics;
  trainerId?: number | null;
}

export interface AdminUser extends BaseUserEntity {
  role: UserRole.ADMIN;
}

export type User = TrainerUser | TraineeUser | AdminUser;

export interface UpdateProfilePayload {
  name?: string;
  phoneNumber?: string;
  bio?: string;          // trainer only
  experience?: string;   // trainer only
  birthDate?: string;    // trainee only, ISO date-time
  gender?: Gender;       // trainee only
  bodyMetrics?: BodyMetrics;      // trainee only
}

export interface UserProfileResponse {
  data: User;
  message?: string;
}