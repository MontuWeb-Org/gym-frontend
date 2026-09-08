import { generateUsersAndProfiles } from "./generators/users.generator";

const initialData = generateUsersAndProfiles(4, 15);

export interface MockUser {
  id: number;
  phoneNumber: string;
  email: string;
  name: string;
  role: "TRAINER" | "TRAINEE" | "ADMIN";
  password: string;
  activationStatus: "ACTIVATED" | "PENDING";
  createdAt: string;
  updatedAt: string;
}

export const mockDb = {
  users: initialData.users as MockUser[],
  trainers: initialData.trainers,
  trainees: initialData.trainees,
  // Stores pending registration data linked to creationToken
  pendingRegistrations: new Map<
    string,
    {
      name: string;
      email: string;
      phoneNumber: string;
      password: string;
    }
  >(),
};