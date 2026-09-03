"use client";

import { useTranslations } from "next-intl";

export default function TraineeDashboardView() {
  const t = useTranslations("Common");

 
  const stats: Array<{ id: string; label: string; value: string; change?: string; icon: React.ReactNode }> = [];
  const activities: Array<{ id: string; title: string; description: string; time: string; timestamp?: string; type?: string }> = [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        
      </div>
    </div>
  );
}