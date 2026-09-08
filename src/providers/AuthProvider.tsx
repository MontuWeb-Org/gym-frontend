"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { refreshTokenThunk } from "@/features/auth/store/auth.slice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Silently refreshes token and populates user in Redux state on app start
    dispatch(refreshTokenThunk());
  }, [dispatch]);

  return <>{children}</>;
}