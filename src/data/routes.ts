// src/data/routes.ts
import { UserRole } from "@/features/user/types/user.types";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  SIGNUP: {
    TRAINEE: "/signup/trainee",
    TRAINER: "/signup/trainer",
  },

  // Shared plan routes — accessible by both trainer and trainee
  PLANS: {
    TIMELINE: (planAssignmentId: string | number) => `/plans/${planAssignmentId}`,
    WORKOUT_TEMPLATE_DETAIL: (
      planAssignmentId: string | number,
      workoutId: string | number
    ) => `/plans/${planAssignmentId}/workouts/${workoutId}`,
    WORKOUT_LOG_DETAIL: (logId: string | number) => `/workout-logs/${logId}`,
  },

  TRAINER: {
    ROOT: "/trainer",
    DASHBOARD: "/trainer/dashboard",
    TRAINEES: "/trainer/trainees",
    TRAINEE_DETAILS: (id: string | number) => `/trainer/trainees/${id}`,
    PROGRAMS: "/trainer/programs",
    TEMPLATES: "/trainer/templates",
    BILLING: "/trainer/billing",
    PROFILE: "/trainer/profile",
  },

  TRAINEE: {
    ROOT: "/trainee",
    TODAYS_WORKOUT: "/trainee/todays-workout",
    PROGRESS: "/trainee/progress",
    NOTIFICATIONS: "/trainee/notifications",
    PROFILE: "/trainee/profile",
    CURRENT_PLANS: "/trainee/current-plans",
  },

  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    MEMBERS: "/admin/members",
    CLASSES: "/admin/classes",
    WORKOUTS: "/admin/workouts",
    PROFILE: "/admin/profile",
    SETTINGS: "/admin/settings",
  },
} as const;

export const getDashboardRoute = (role?: UserRole | string): string => {
  switch (role) {
    case UserRole.ADMIN:
      return ROUTES.ADMIN.DASHBOARD;
    case UserRole.TRAINER:
      return ROUTES.TRAINER.DASHBOARD;
    case UserRole.TRAINEE:
      return ROUTES.TRAINEE.TODAYS_WORKOUT;
    default:
      return ROUTES.LOGIN;
  }
};