"use client";

import React from "react";
import { AppLayout } from "./AppLayout";

export function CoachMainLayout({ children }: { children?: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
