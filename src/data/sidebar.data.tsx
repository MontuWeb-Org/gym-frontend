import React from "react";
import { UserRole } from "./routes";
import { SidebarItem, RoleSidebarConfig } from "./sidebar.types";
import { ADMIN_SIDEBAR_DATA, ADMIN_SIDEBAR_TITLE } from "./sidebars/adminSidebar.data";
import { COACH_SIDEBAR_DATA, COACH_SIDEBAR_TITLE } from "./sidebars/coachSidebar.data";
import { TRAINEE_SIDEBAR_DATA, TRAINEE_SIDEBAR_TITLE } from "./sidebars/traineeSidebar.data";

export type { SidebarItem, RoleSidebarConfig };

export const ROLE_SIDEBAR_DATA: Record<UserRole, RoleSidebarConfig> = {
  admin: {
    title: ADMIN_SIDEBAR_TITLE,
    items: ADMIN_SIDEBAR_DATA,
  },
  coach: {
    title: COACH_SIDEBAR_TITLE,
    items: COACH_SIDEBAR_DATA,
  },
  trainee: {
    title: TRAINEE_SIDEBAR_TITLE,
    items: TRAINEE_SIDEBAR_DATA,
  },
};

export {
  ADMIN_SIDEBAR_DATA,
  ADMIN_SIDEBAR_TITLE,
  COACH_SIDEBAR_DATA,
  COACH_SIDEBAR_TITLE,
  TRAINEE_SIDEBAR_DATA,
  TRAINEE_SIDEBAR_TITLE,
};
