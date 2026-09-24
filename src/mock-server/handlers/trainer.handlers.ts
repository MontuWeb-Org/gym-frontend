import { http, HttpResponse } from "msw";
import { mockDb, MockUserRole } from "../db";
import planAssignmentsData from "../data/planAssignments.json";
import planTemplatesData from "../data/planTemplates.json";
import weekTemplatesData from "../data/weekTemplates.json";
import workoutTemplatesData from "../data/workoutTemplates.json";
import workoutExerciseTemplatesData from "../data/workoutExerciseTemplates.json";
import exercisesData from "../data/exercises.json";


// Helper to extract userId from "Bearer mock_jwt_{userId}_{timestamp}"
function getUserIdFromToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const parts = token.split("_");
  return parts.length >= 3 ? parts[2] : null;
}

export const trainerHandlers = [
  http.get("*/api/plans/assignments/:assignmentId/workouts/:workoutTemplateId", async ({ request, params }) => {
    if (!getUserIdFromToken(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const workoutTemplateId = Number(params.workoutTemplateId);
    const details = workoutExerciseTemplatesData
      .filter((template) => template.workoutTemplateId === workoutTemplateId)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
      .map((template) => {
        const exercise = exercisesData.find((item) => item.id === template.exerciseId);
        return {
          id: template.id,
          exerciseId: template.exerciseId,
          exerciseName: exercise?.name ?? `Exercise ${template.exerciseId}`,
          sequenceNumber: template.sequenceNumber,
          defaultSets: template.defaultSets,
          defaultReps: template.defautlReps,
          defaultWeight: Number(template.defaultWeight),
          defaultRestTimeSeconds: template.defaultRestTimeSeconds,
        };
      });

    const workout = workoutTemplatesData.find(
      (template) => template.id === workoutTemplateId
    );
    return HttpResponse.json({
      data: {
        id: workoutTemplateId,
        name: workout?.name ?? `Workout ${workoutTemplateId}`,
        sequenceNumber: workout?.sequenceNumber ?? 0,
        weekTemplate: {
          id: workout?.weekTemplateId ?? 0,
          sequenceNumber: 0,
          planTemplate: {
            id: 0,
            name: "Mock Plan",
            description: "Mock workout details",
            trainerId: 0,
          },
        },
        exercisesTemplates: details.map((detail) => ({
          id: detail.id,
          sequenceNumber: detail.sequenceNumber,
          exercise: {
            id: detail.exerciseId,
            name: detail.exerciseName,
            equipment: [],
            illustrations: [],
            instructions: "",
            difficulty: "",
          },
          durationMinutes: 15,
          sets: detail.defaultSets,
          reps: detail.defaultReps,
          weight: detail.defaultWeight,
          restSeconds: detail.defaultRestTimeSeconds,
        })),
      },
    });
  }),

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

  // 4. Get Plan Assignment Timeline
  http.get("*/api/plans/assignments/:planAssignmentId", async ({ request, params }) => {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { planAssignmentId } = params;
    const assignment = planAssignmentsData.find(
      (pa) => String(pa.id) === String(planAssignmentId)
    );

    if (!assignment) {
      return HttpResponse.json({ message: "Plan assignment not found" }, { status: 404 });
    }

    const planTemplate = planTemplatesData.find(
      (pt) => pt.id === assignment.planTemplateId
    );

    if (!planTemplate) {
      return HttpResponse.json({ message: "Plan template not found" }, { status: 404 });
    }

    const weekTemplates = weekTemplatesData.filter(
      (wt) => wt.planTemplateId === planTemplate.id
    );

    // Build a richer multi-week timeline by repeating weeks if the plan only has 1 week
    // We always generate 3 weeks of content for demo richness
    const allWeeks = [...weekTemplates].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    const demoWeeks = [1, 2, 3].map((weekNum) => {
      const baseWeek = allWeeks[(weekNum - 1) % allWeeks.length];
      return { ...baseWeek, sequenceNumber: weekNum };
    });

    // Assign statuses across weeks:
    // Week 1, workout 1: completed
    // Week 1, workout 2: skipped
    // Week 2, workout 1: in_progress (current week/workout)
    // Week 2, workout 2: not_started (upcoming)
    // Week 3, workout 1 & 2: not_started (future)
    const WEEK_WORKOUT_STATUS: Record<string, "completed" | "skipped" | "in_progress"> = {
      "1-1": "completed",
      "1-2": "skipped",
      "2-1": "in_progress",
    };

    const weekTemplatesWithWorkouts = demoWeeks.map((week) => {
      const workouts = workoutTemplatesData
        .filter((wt) => wt.weekTemplateId === week.id)
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
        .map((workout) => {
          const key = `${week.sequenceNumber}-${workout.sequenceNumber}`;
          const logStatus = WEEK_WORKOUT_STATUS[key];

          const workoutLog = logStatus
            ? {
                id: 1000 + week.sequenceNumber * 10 + workout.sequenceNumber,
                workoutTemplateId: workout.id,
                durationMinutes: 45 + (workout.id % 30),
                status: logStatus,
              }
            : undefined;

          return {
            id: workout.id,
            name: workout.name,
            sequenceNumber: workout.sequenceNumber,
            ...(workoutLog ? { workoutLog } : {}),
          };
        });

      return {
        id: week.id + (week.sequenceNumber - 1) * 100, // unique ids for demo
        sequenceNumber: week.sequenceNumber,
        workouts,
      };
    });

    // currentWeekIdx=2, currentWorkoutIdx=2 → the target "current" workout (no log yet)
    // Week 2 workout 1 has in_progress log, Week 2 workout 2 has no log → shown as "current"
    const currentWeekIdx = 2;
    const currentWorkoutIdx = 2;

    return HttpResponse.json({
      data: {
        currentWeekIdx,
        currentWorkoutIdx,
        status: assignment.status,
        startedAt: assignment.startedAt,
        planTemplate: {
          id: planTemplate.id,
          name: planTemplate.name,
          description: planTemplate.description,
          trainerId: planTemplate.trainerId,
          weekTemplates: weekTemplatesWithWorkouts,
        },
      },
    });
  }),


  // 5. Start a Workout
  http.post(
    "*/api/plans/assignments/:planAssignmentId/workouts/:workoutTemplateId/start",
    async ({ request }) => {
      const userId = getUserIdFromToken(request);
      if (!userId) {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      return HttpResponse.json({ message: "Workout started" }, { status: 200 });
    }
  ),

  // 6. Skip a Workout
  http.post(
    "*/api/plans/assignments/:planAssignmentId/workouts/:workoutTemplateId/skip",
    async ({ request }) => {
      const userId = getUserIdFromToken(request);
      if (!userId) {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      return HttpResponse.json({ message: "Workout skipped" }, { status: 200 });
    }
  ),

  // 7. Get Trainee Active Plans
  http.get("*/api/plans/assignments/active", async ({ request }) => {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const assignment = planAssignmentsData[0];
    const planTemplate = planTemplatesData.find((pt) => pt.id === assignment?.planTemplateId);

    return HttpResponse.json({
      data: {
        activePlans: [
          {
            planId: assignment?.id ?? 1,
            name: planTemplate?.name ?? "Hypertrophy Foundations",
            status: assignment?.status ?? "ACTIVE",
            startedAt: assignment?.startedAt ?? new Date().toISOString(),
            adherencePercentage: 85.5,
            planTemplateId: assignment?.planTemplateId ?? 1,
            currentWorkout: {
              workoutTemplateId: 2,
              name: "Day 2 - Full Body",
              sequenceNumber: 2,
              weekSequenceNumber: 2,
            },
          },
        ],
      },
    });
  }),
];