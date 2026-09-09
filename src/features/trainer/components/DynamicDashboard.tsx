"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { DashboardWidgetConfig, TrainerDashboardResponse } from "../types/dashboard.types";
import ScoreCardWidget from "./ScoreCardWidget";
import ChartWidget from "./ChartWidget";
import TableWidget from "./TableWidget";
import WidgetErrorBoundary from "./WidgetErrorBoundary";
import DashboardSkeleton from "./DashboardSkeleton";
import { useTranslations } from "next-intl";

export default function DynamicDashboard() {
  const t = useTranslations ("Trainer.dashboard");
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = Cookies.get("accessToken");
        const res = await fetch("/api/users/trainer/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        
        if (!res.ok) throw new Error(json?.message || "Failed to load dashboard layout");
        
        const dashboardData: TrainerDashboardResponse = json?.data || json;
        setWidgets(dashboardData.widgets || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-center text-destructive">
        <p className="font-semibold">Dashboard Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {widgets.map((widget) => (
        <div key={widget.id} className={widget.colSpan || "col-span-1"}>
          <WidgetErrorBoundary widgetId={widget.id}>
            {widget.type === "score_card" && <ScoreCardWidget data={widget.data as any} />}
            {widget.type === "chart" && <ChartWidget data={widget.data as any} />}
            {widget.type === "table" && <TableWidget data={widget.data as any} />}
          </WidgetErrorBoundary>
        </div>
      ))}
    </div>
  );
}