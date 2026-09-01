"use client";

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <Button
      suppressHydrationWarning
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "fixed bottom-16 end-6 z-50",
        "size-12 rounded-full shadow-lg",
        "bg-primary text-primary-foreground",
        "flex items-center justify-center",
        "transition-transform hover:scale-105 active:scale-95 cursor-pointer",
        className
      )}
    >
      {!mounted ? (
        <div className="size-5" />
      ) : theme === "dark" ? (
        <Sun size={20} className="transition-transform rotate-0" />
      ) : (
        <Moon size={20} className="transition-transform rotate-0" />
      )}
    </Button>
  );
}