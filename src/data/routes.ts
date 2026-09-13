import { UserRole } from "@/types/user.types";

export type IconName =
  | "dashboard"
  | "classes"
  | "members"
  | "workouts"
  | "profile"
  | "settings"
  | "auth"
  | "home"
  | "programs"
  | "templates"
  | "billing";

export interface RouteConfig {
  id: string;
  path: string;
  titleKey: string;
  isPublic?: boolean;
  allowedRoles?: UserRole[];
  showInSidebar?: boolean;
  showInNavbar?: boolean;
  iconName?: IconName;
}

export const APP_ROUTES: RouteConfig[] = [
  // Public Routes
  {
    id: "home",
    path: "/",
    titleKey: "home",
    isPublic: true,
    showInNavbar: true,
    iconName: "home",
  },
  {
    id: "login",
    path: "/login",
    titleKey: "login",
    isPublic: true,
    showInNavbar: true,
    iconName: "auth",
  },
  {
    id: "signup-trainee",
    path: "/auth/signup/trainee",
    titleKey: "signupTrainee",
    isPublic: true,
  },
  {
    id: "signup-trainer",
    path: "/auth/signup/trainer",
    titleKey: "signupTrainer",
    isPublic: true,
  },
  {
    id: "forgot-password",
    path: "/forgot-password",
    titleKey: "forgotPassword",
    isPublic: true,
  },

  // Trainer Routes
  {
    id: "trainer-dashboard",
    path: "/trainer",
    titleKey: "dashboard",
    showInSidebar: true,
    allowedRoles: [UserRole.TRAINER],
    iconName: "dashboard",
  },
  {
    id: "trainer-trainees",
    path: "/trainer/trainees",
    titleKey: "trainees",
    showInSidebar: true,
    allowedRoles: [UserRole.TRAINER],
    iconName: "members",
  },
  {
    id: "trainer-programs",
    path: "/trainer/programs",
    titleKey: "programs",
    showInSidebar: true,
    allowedRoles: [UserRole.TRAINER],
    iconName: "programs",
  },
  {
    id: "trainer-templates",
    path: "/trainer/templates",
    titleKey: "templates",
    showInSidebar: true,
    allowedRoles: [UserRole.TRAINER],
    iconName: "templates",
  },
  {
    id: "trainer-billing",
    path: "/trainer/billing",
    titleKey: "billing",
    showInSidebar: true,
    allowedRoles: [UserRole.TRAINER],
    iconName: "billing",
  },
  {
    id: "trainer-settings",
    path: "/trainer/settings",
    titleKey: "settings",
    showInSidebar: true,
    allowedRoles: [UserRole.TRAINER],
    iconName: "settings",
  },

  // Trainee Routes
  {
    id: "trainee-dashboard",
    path: "/trainee",
    titleKey: "dashboard",
    showInSidebar: true,
    allowedRoles: [UserRole.TRAINEE],
    iconName: "dashboard",
  },
  {
    id: "trainee-workouts",
    path: "/trainee/workouts",
    titleKey: "workouts",
    showInSidebar: true,
    allowedRoles: [UserRole.TRAINEE],
    iconName: "workouts",
  },
  {
    id: "trainee-settings",
    path: "/trainee/settings",
    titleKey: "settings",
    showInSidebar: true,
    allowedRoles: [UserRole.TRAINEE],
    iconName: "settings",
  },

  // Admin Routes
  {
    id: "admin-dashboard",
    path: "/admin",
    titleKey: "admin",
    showInSidebar: true,
    allowedRoles: [UserRole.ADMIN],
    iconName: "dashboard",
  },
];

// Helper object for typed route access across components
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  SIGNUP_TRAINEE: "/auth/signup/trainee",
  SIGNUP_TRAINER: "/auth/signup/trainer",

  TRAINER: {
    ROOT: "/trainer",
    DASHBOARD: "/trainer/dashboard",
    TRAINEES: "/trainer/trainees",
    TRAINEE_DETAILS: (id: string) => `/trainer/trainees/${id}`,
    PROGRAMS: "/trainer/programs",
    TEMPLATES: "/trainer/templates",
    BILLING: "/trainer/billing",
    SETTINGS: "/trainer/settings",
  },

  TRAINEE: {
    ROOT: "/trainee",
    DASHBOARD: "/trainee/dashboard",
    WORKOUTS: "/trainee/workouts",
    SETTINGS: "/trainee/settings",
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