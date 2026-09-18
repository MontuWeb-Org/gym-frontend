import { http, HttpResponse } from "msw";
import { mockDb } from "../db";
import { UpdateProfilePayload } from "@/features/user/types/user.types";

function getUserIdFromToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const parts = token.split("_");
  return parts.length >= 3 ? parts[2] : null;
}

export const userHandlers = [
  // PUT /api/users/me - Update profile handler
  http.put("*/api/users/me", async ({ request }) => {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return HttpResponse.json(
        { message: "Unauthorized access token" },
        { status: 401 }
      );
    }

    const currentUser = mockDb.users.find((u) => String(u.id) === String(userId));

    if (!currentUser) {
      return HttpResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as UpdateProfilePayload;

    // 1. Update general user fields
    if (body.name !== undefined) currentUser.name = body.name;
    if (body.phoneNumber !== undefined) currentUser.phoneNumber = body.phoneNumber;
    currentUser.updatedAt = new Date().toISOString();

    // 2. Update role-specific fields
    if (currentUser.role === "TRAINER" || currentUser.role === "ADMIN") {
      const trainerProfile = mockDb.trainers.find((t) => String(t.userId) === String(userId));
      if (trainerProfile) {
        if (body.bio !== undefined) trainerProfile.bio = body.bio;
        if (body.experience !== undefined) trainerProfile.experience = body.experience;
        trainerProfile.updatedAt = currentUser.updatedAt;
      }
    } else if (currentUser.role === "TRAINEE") {
      const traineeProfile = mockDb.trainees.find((t) => String(t.userId) === String(userId));
      if (traineeProfile) {
        if (body.gender !== undefined) {
          traineeProfile.gender = body.gender.toUpperCase() as "MALE" | "FEMALE";
        }
        if (body.birthDate !== undefined) traineeProfile.birthDate = body.birthDate;
        if (body.bodyMetrics !== undefined && body.bodyMetrics !== null) {
          traineeProfile.bodyMetrics = {
            ...traineeProfile.bodyMetrics,
            ...body.bodyMetrics,
          };
        }
        traineeProfile.updatedAt = currentUser.updatedAt;
      }
    }

    return HttpResponse.json(
      { message: "Profile updated successfully." },
      { status: 200 }
    );
  }),
];