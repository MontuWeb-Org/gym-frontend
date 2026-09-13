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

  // 2. Get Trainer Dashboard Widgets
  http.get("*/api/users/trainer/dashboard", async ({ request }) => {
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

    if (currentUser.role !== MockUserRole.TRAINER && currentUser.role !== MockUserRole.ADMIN) {
      return HttpResponse.json(
        { message: "Forbidden: Access restricted to trainers" },
        { status: 403 }
      );
    }

    let assignedTraineeProfiles = mockDb.trainees.filter(
      (t) => String(t.trainerId) === String(currentUser.id)
    );

    if (assignedTraineeProfiles.length === 0) {
      assignedTraineeProfiles = mockDb.trainees;
    }

    const formattedTrainees = assignedTraineeProfiles.map((traineeProfile) => {
      const userAccount = mockDb.users.find((u) => u.id === traineeProfile.userId);
      const statuses = ["ON_TRACK", "AT_RISK", "INVITE_PENDING", "FALLING_BEHIND"] as const;
      const status = statuses[Number(traineeProfile.userId) % statuses.length];
      const isPending = status === "INVITE_PENDING" || userAccount?.activationStatus === "PENDING";

      return {
        id: traineeProfile.userId,
        name: userAccount?.name || "Trainee User",
        adherence: isPending ? 0 : Math.min(100, (Number(traineeProfile.userId) * 23) % 100),
        programName: isPending ? "—" : `Strength Block ${((Number(traineeProfile.userId) % 3) + 1)}`,
        status: isPending ? "INVITE_PENDING" : status,
        lastSessionDate: isPending ? "—" : new Date(Date.now() - (Number(traineeProfile.userId) % 5) * 86400000).toISOString(),
      };
    });

    const totalTrainees = formattedTrainees.length;
    const pendingInvites = formattedTrainees.filter((t) => t.status === "INVITE_PENDING").length;
    const activeProgramsCount = formattedTrainees.filter(
      (t) => t.status === "ON_TRACK" || t.status === "AT_RISK"
    ).length;
    
    const avgAdherence = totalTrainees > 0
      ? Math.round(formattedTrainees.reduce((acc, t) => acc + t.adherence, 0) / totalTrainees)
      : 0;

    const fallingBehindRows = formattedTrainees
      .filter((t) => t.status === "FALLING_BEHIND")
      .map((t) => ({
        id: String(t.id),
        name: t.name,
        adherence: `${t.adherence}%`,
        lastSession: t.lastSessionDate,
      }));

    return HttpResponse.json({
      data: {
        widgets: [
          {
            id: "metric-total-trainees",
            type: "score_card",
            colSpan: "col-span-1",
            data: { titleKey: "totalTrainees", value: String(totalTrainees), iconName: "users" },
          },
          {
            id: "metric-adherence",
            type: "score_card",
            colSpan: "col-span-1",
            data: { titleKey: "avgAdherence", value: `${avgAdherence}%`, iconName: "activity" },
          },
          {
            id: "metric-active-programs",
            type: "score_card",
            colSpan: "col-span-1",
            data: { titleKey: "activePrograms", value: String(activeProgramsCount), iconName: "check" },
          },
          {
            id: "metric-pending-invites",
            type: "score_card",
            colSpan: "col-span-1",
            data: { titleKey: "pendingInvites", value: String(pendingInvites), iconName: "users" },
          },
          {
            id: "table-falling-behind",
            type: "table",
            colSpan: "col-span-1 md:col-span-2 lg:col-span-4",
            data: {
              titleKey: "fallingBehindTitle",
              rows: fallingBehindRows,
            },
          },
          {
            id: "chart-weekly-activity",
            type: "chart",
            colSpan: "col-span-1 md:col-span-2 lg:col-span-4",
            data: {
              titleKey: "weeklyActivityTitle",
              chartType: "bar",
              labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
              datasets: [
                { labelKey: "workoutsLogged", data: [4, 8, 6, 12, 9, 3, 2] }
              ],
            },
          },
        ],
      },
    });
  }),

  // 3. Get Detailed Trainee Information
  http.get("*/api/users/trainer/trainees/:traineeId", async ({ request, params }) => {
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

    const { traineeId } = params;
    const targetId = String(traineeId);

    // Search mock database for the target trainee and user account
    const traineeProfile = mockDb.trainees.find((t) => String(t.userId) === targetId);
    const traineeUser = mockDb.users.find((u) => String(u.id) === targetId);

    if (!traineeUser || !traineeProfile) {
      return HttpResponse.json(
        { message: "Trainee not found" },
        { status: 404 }
      );
    }

    // Deterministic metrics matching the list endpoint calculations
    const statuses = ["ON_TRACK", "AT_RISK", "INVITE_PENDING", "FALLING_BEHIND"] as const;
    const computedStatus = statuses[Number(traineeUser.id) % statuses.length];
    const isPending =
      computedStatus === "INVITE_PENDING" || traineeUser.activationStatus === "PENDING";
    const status = isPending ? "INVITE_PENDING" : computedStatus;

    const numId = Number(traineeUser.id);

    return HttpResponse.json({
      data: {
        id: traineeUser.id,
        name: traineeUser.name,
        adherence: isPending ? 0 : Math.min(100, (numId * 23) % 100),
        programName: isPending ? "—" : `Strength Block ${(numId % 3) + 1}`,
        lastSessionDate: isPending
          ? "—"
          : new Date(Date.now() - (numId % 5) * 86400000).toISOString(),
        status,
        joinedAt: traineeUser.createdAt,
        programJoinedAt: traineeProfile.createdAt,
        
        // Extended UI display metrics
        streakWeeks: isPending ? 0 : (numId % 6) + 1,
        topLiftPr: isPending ? "—" : `+${(numId % 10) + 2}kg`,
        recentSessions: isPending
          ? []
          : [
              {
                id: "1",
                date: "Aug 28",
                sessionName: "Upper A",
                completedSets: "6/6 sets",
                notes: "felt strong",
              },
              {
                id: "2",
                date: "Aug 26",
                sessionName: "Lower A",
                completedSets: "5/6 sets",
                notes: "—",
              },
            ],
      },
    });
  }),
];