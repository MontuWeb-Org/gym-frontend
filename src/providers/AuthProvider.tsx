"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { initializeAuthThunk } from "@/features/auth/store/auth.slice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuthThunk());
  }, [dispatch]);

  return <>{children}</>;
}