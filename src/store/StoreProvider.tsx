"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { setUser } from "@/store/slices/authSlice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gym_auth_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user && user.role) {
          store.dispatch(setUser(user));
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  }, []);

  return <>{children}</>;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}