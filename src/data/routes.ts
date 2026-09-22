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

  TRAINER: {
    ROOT: "/trainer",
    DASHBOARD: "/trainer/dashboard",
    TRAINEES: "/trainer/trainees",
    TRAINEE_DETAILS: (id: number) => `/trainer/trainees/${id}`,
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