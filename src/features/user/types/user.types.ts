export enum UserRole {
  ADMIN = "ADMIN",
  TRAINER = "TRAINER",
  TRAINEE = "TRAINEE",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
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
}

export interface TrainerProfile {
  bio?: string;
  experience?: string;
  traineesFallingBehindThreshold?: number;
  traineesAtRiskThreshold?: number;
}

export interface TraineeProfile {
  birthDate?: string;
  gender?: Gender;
  bodyMetrics?: BodyMetrics;
  trainerId?: number;
  trainerName?: string;
}

export interface TrainerUser extends BaseUserEntity {
  role: UserRole.TRAINER;
  profile: TrainerProfile;
}

export interface TraineeUser extends BaseUserEntity {
  role: UserRole.TRAINEE;
  profile: TraineeProfile;
}

export interface AdminUser extends BaseUserEntity {
  role: UserRole.ADMIN;
  profile?: Record<string, never>;
}

export type User = TrainerUser | TraineeUser | AdminUser;

export interface UpdateProfilePayload {
  name?: string;
  phoneNumber?: string;
  profile?: {
    bio?: string;
    experience?: string;
    birthDate?: string;
    gender?: Gender;
    bodyMetrics?: BodyMetrics;
  };
}

export interface UserProfileResponse {
  data: User;
  message?: string;
}