"use client";

import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useAppSelector } from "@/store/hooks";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const user = useAppSelector((state) => state.auth.user);
  const currentUserRole = user?.role ?? "trainee";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navbar with mobile dropdown menu */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with bottom-left mobile toggle */}
        <Sidebar currentUserRole={currentUserRole} />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}