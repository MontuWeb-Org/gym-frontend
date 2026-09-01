"use client";

import React from "react";
import { AppLayout } from "./AppLayout";

export function TraineeMainLayout({ children }: { children?: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
