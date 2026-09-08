import usersData from "./data/users.json";
import trainersData from "./data/trainers.json";
import traineesData from "./data/trainees.json";

export enum MockUserRole {
  ADMIN = "ADMIN",
  TRAINER = "TRAINER",
  TRAINEE = "TRAINEE",
}

export interface MockUser {
  id: number;
  phoneNumber: string;
  email: string;
  name: string;
  role: MockUserRole;
  password: string;
  activationStatus: "ACTIVATED" | "PENDING";
  createdAt: string;
  updatedAt: string;
}

export const mockDb = {
  users: usersData as MockUser[],
  trainers: trainersData,
  trainees: traineesData,
  pendingRegistrations: new Map<
    string,
    {
      name: string;
      email: string;
      phoneNumber: string;
      password: string;
    }
  >(),
  pendingPasswordResets: new Map<string, { email: string }>(),
};