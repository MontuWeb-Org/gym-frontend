"use client";

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "fixed bottom-6 end-6 z-50",
        "h-12 w-12 rounded-full shadow-lg",
        "bg-primary text-primary-foreground",
        "flex items-center justify-center",
        "transition-transform hover:scale-105 active:scale-95",
        className
      )}
    >
      {theme === "dark" ? (
        <Sun size={20} className="transition-transform rotate-0" />
        ) : (
        <Moon size={20} className="transition-transform rotate-0" />
        )}
    </button>
  );
}