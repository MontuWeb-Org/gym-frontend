"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/features/auth";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Safely rehydrate auth state on client mount (prevents SSR hydration mismatch)
    const storedUser = localStorage.getItem("gym_auth_user");
    if (storedUser) {
      try {
        dispatch(setUser(JSON.parse(storedUser)));
      } catch {
        localStorage.removeItem("gym_auth_user");
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}