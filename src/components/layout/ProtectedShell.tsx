"use client";

import React from "react";
import { usePathname } from "@/i18n/navigation";
import { AppLayout } from "./AppLayout";

/**
 * Smart Protected Shell.
 * If navigating within role-specific routes (/admin/*, /coach/*, /trainee/*),
 * it allows the dedicated role layout shells to manage the Sidebar.
 * For shared protected sub-pages (/classes, /members, /workouts, /profile, /settings),
 * it wraps content inside the AppLayout shell so the Navbar and Sidebar never unmount.
 */
export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isRoleSpecificRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/coach") ||
    pathname.startsWith("/trainee");

  if (isRoleSpecificRoute) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}
