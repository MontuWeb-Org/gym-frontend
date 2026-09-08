export type UserRole = "admin" | "trainer" | "trainee";

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
    path: "",
    titleKey: "home",
    isPublic: true,
    showInNavbar: true,
    iconName: "home",
  },
  {
    id: "login",
    path: "login",
    titleKey: "login",
    isPublic: true,
    showInNavbar: true,
    iconName: "auth",
  },
  {
    id: "signup-trainer",
    path: "auth/signup/trainer",
    titleKey: "signupTrainer",
    isPublic: true,
  },
  // User/Trainee Dashboard Route
  {
    id: "trainee-dashboard",
    path: "trainee",
    titleKey: "dashboard",
    showInSidebar: true,
    allowedRoles: ["trainee"],
    iconName: "dashboard",
  },
  // Trainer Dashboard Route
  {
    id: "trainer-dashboard",
    path: "trainer",
    titleKey: "trainer",
    showInSidebar: true,
    allowedRoles: ["trainer"],
    iconName: "dashboard",
  },
  // Admin Dashboard Route
  {
    id: "admin-dashboard",
    path: "admin",
    titleKey: "admin",
    showInSidebar: true,
    allowedRoles: ["admin"],
    iconName: "dashboard",
  },
];