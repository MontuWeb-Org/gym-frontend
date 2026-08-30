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
  // User/Trainee Dashboard Route
  {
    id: "dashboard",
    path: "/trainee/dashboard",
    titleKey: "dashboard",
    showInSidebar: true,
    allowedRoles: [ "trainee"],
    iconName: "dashboard",
  },
  // Coach Dashboard Route
  {
    id: "coach",
    path: "/coach/dashboard",
    titleKey: "coach",
    showInSidebar: true,
    allowedRoles: ["coach"],
    iconName: "dashboard",
  },
  // Admin Dashboard Route
  {
    id: "admin",
    path: "/admin/dashboard",
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
    allowedRoles: ["admin", "coach"], // Explicitly allows both admin and coach!
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