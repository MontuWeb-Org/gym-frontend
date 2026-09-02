export type UserRole = "admin" | "coach" | "trainee";

export interface RouteConfig {
  id: string;
  path: string;
  titleKey: string;
  isPublic?: boolean;
  allowedRoles?: UserRole[];
  showInSidebar?: boolean;
  showInNavbar?: boolean;
  iconName?: "dashboard" | "classes" | "members" | "workouts" | "profile" | "settings" | "auth" | "home";
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
    id: "signup-coach",
    path: "/auth/signup/coach",
    titleKey: "signupCoach",
    isPublic: true,
  },
  // User/Trainee Dashboard Route
  {
    id: "trainee-dashboard",
    path: "/trainee",
    titleKey: "dashboard",
    showInSidebar: true,
    allowedRoles: ["trainee"],
    iconName: "dashboard",
  },
  // Coach Dashboard Route
  {
    id: "coach-dashboard",
    path: "/coach",
    titleKey: "coach",
    showInSidebar: true,
    allowedRoles: ["coach"],
    iconName: "dashboard",
  },
  // Admin Dashboard Route
  {
    id: "admin-dashboard",
    path: "/admin",
    titleKey: "admin",
    showInSidebar: true,
    allowedRoles: ["admin"],
    iconName: "dashboard",
  },
  {
    id: "classes",
    path: "/classes",
    titleKey: "classes",
    showInSidebar: true,
    allowedRoles: ["admin", "coach", "trainee"],
    iconName: "classes",
  },
  {
    id: "workouts",
    path: "/workouts",
    titleKey: "workouts",
    showInSidebar: true,
    allowedRoles: ["admin", "coach", "trainee"],
    iconName: "workouts",
  },
  // Coach & Admin Shared Route for Members
  {
    id: "members",
    path: "/members",
    titleKey: "members",
    showInSidebar: true,
    allowedRoles: ["admin", "coach"],
    iconName: "members",
  },
  {
    id: "profile",
    path: "/profile",
    titleKey: "profile",
    showInSidebar: true,
    allowedRoles: ["admin", "coach", "trainee"],
    iconName: "profile",
  },
  {
    id: "settings",
    path: "/settings",
    titleKey: "settings",
    showInSidebar: true,
    allowedRoles: ["admin"],
    iconName: "settings",
  },
];