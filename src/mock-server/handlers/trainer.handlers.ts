import { http, HttpResponse } from "msw";
import { mockDb, MockUserRole } from "../db";

// Helper to extract userId from "Bearer mock_jwt_{userId}_{timestamp}"
function getUserIdFromToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const parts = token.split("_");
  return parts.length >= 3 ? parts[2] : null;
}

export const trainerHandlers = [
  // 1. Get Trainer's Trainees List (Paginated)
  http.get("*/api/users/trainer/trainees", async ({ request }) => {
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

    // Restrict access to Trainers and Admins
    if (currentUser.role !== MockUserRole.TRAINER && currentUser.role !== MockUserRole.ADMIN) {
      return HttpResponse.json(
        { message: "Forbidden: Access restricted to trainers" },
        { status: 403 }
      );
    }

    // Parse URL query parameters
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10));

    // Find trainees assigned to this trainer ID in mockDb
    let assignedTraineeProfiles = mockDb.trainees.filter(
      (t) => String(t.trainerId) === String(currentUser.id)
    );

    // Fallback: If logged-in trainer has no assigned trainees, return all generated trainees for demo purposes
    if (assignedTraineeProfiles.length === 0) {
      assignedTraineeProfiles = mockDb.trainees;
    }

    // Combine trainee profile data with user account details
    const formattedTrainees = assignedTraineeProfiles.map((traineeProfile) => {
      const userAccount = mockDb.users.find((u) => u.id === traineeProfile.userId);

      // Pseudo-deterministic status and metric logic based on ID for consistent UI display
      const statuses = ["ON_TRACK", "AT_RISK", "INVITE_PENDING", "FALLING_BEHIND"] as const;
      const status = statuses[Number(traineeProfile.userId) % statuses.length];
      const isPending = status === "INVITE_PENDING" || userAccount?.activationStatus === "PENDING";

      return {
        id: traineeProfile.userId,
        name: userAccount?.name || "Trainee User",
        adherence: isPending ? 0 : Math.min(100, (Number(traineeProfile.userId) * 23) % 100),
        programName: isPending ? "—" : `Strength Block ${((Number(traineeProfile.userId) % 3) + 1)}`,
        lastSessionDate: isPending
          ? "—"
          : new Date(Date.now() - (Number(traineeProfile.userId) % 5) * 86400000).toISOString(),
        status: isPending ? "INVITE_PENDING" : status,
      };
    });

    // Offset-based pagination
    const total = formattedTrainees.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedTrainees = formattedTrainees.slice(startIndex, startIndex + limit);

    return HttpResponse.json({
      data: {
        trainees: paginatedTrainees,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  }),
];