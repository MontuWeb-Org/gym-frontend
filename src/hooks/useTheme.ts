"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const emptySubscribe = () => () => {};

function getSnapshot(): Theme {
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  // Hydration-safe mounted check without using state or effects
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [themeState, setThemeState] = useState<Theme | null>(null);

  // Derive theme directly during render
  const theme = themeState ?? (mounted ? getSnapshot() : "light");

  // Effect only updates DOM (no setState inside effect)
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    localStorage.setItem("theme", next);
  };

  return { theme, toggleTheme, mounted };
}