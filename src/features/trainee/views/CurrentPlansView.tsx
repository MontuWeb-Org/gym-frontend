"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CalendarX, AlertCircle, RefreshCw } from "lucide-react";
import { traineePlanService } from "../services/plan.service";
import { PlanTimelineView } from "@/features/trainer/views/PlanTimelineView";
import { Button } from "@/components/ui/button";

export function CurrentPlansView() {
  const t = useTranslations("PlanTimeline");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePlanId, setActivePlanId] = useState<number | null>(null);

  const fetchActivePlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const plans = await traineePlanService.getActivePlans();
      if (plans.length > 0) {
        // Take the first active plan and display its timeline
        const targetId = Number(plans[0].planId ?? plans[0].id);
        setActivePlanId(targetId);
      } else {
        setActivePlanId(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load active plans";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePlans();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">{t("loading")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-destructive">{error}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchActivePlans}
          className="gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (!activePlanId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border p-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <CalendarX className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">
            {t("noActivePlans")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            {t("noActivePlansDesc")}
          </p>
        </div>
      </div>
    );
  }

  return <PlanTimelineView planAssignmentId={activePlanId} />;
}
