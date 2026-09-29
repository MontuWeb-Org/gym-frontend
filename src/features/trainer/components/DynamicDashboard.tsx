"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, ArrowRight, ChevronRight } from "lucide-react";

import type {
  AppDispatch,
  RootState,
} from "@/store/index";

import {
  fetchAtRiskTrainees,
  fetchTrainerDashboard,
} from "../store/dashboard.slice";

import ScoreCardWidget from "./ScoreCardWidget";
import ChartWidget from "./ChartWidget";
import WidgetErrorBoundary from "./WidgetErrorBoundary";
import DashboardSkeleton from "./DashboardSkeleton";
import { ROUTES } from "@/data/routes";

export default function DynamicDashboard() {
  const t = useTranslations("Trainer.dashboard");

  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();

  const {
    dashboard,
    atRiskTrainees,
    isLoading,
    isAtRiskLoading,
    error,
    atRiskError,
  } = useSelector(
    (state: RootState) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchTrainerDashboard());
    dispatch(fetchAtRiskTrainees());
  }, [dispatch]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-center text-destructive">
        <p className="font-semibold">
          {t("errorTitle")}
        </p>

        <p className="text-sm">
          {error}
        </p>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const weeklyActivity =
    dashboard.weeklyActivity;

  const chartData = {
    title: "",
    titleKey: "weeklyActivityTitle",
    chartType: "bar" as const,

    labels: ["days.sun", "days.mon", "days.tue", "days.wed", "days.thu", "days.fri", "days.sat"],

    datasets: [
      {
        labelKey: "workoutsLogged",

        data: [
          weeklyActivity.sun,
          weeklyActivity.mon,
          weeklyActivity.tues,
          weeklyActivity.wed,
          weeklyActivity.thurs,
          weeklyActivity.fri,
          weeklyActivity.sat,
        ],
      },
    ],
  };

  const renderAtRiskContent = () => {
    if (isAtRiskLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-[72px] animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      );
    }

    if (atRiskError) {
      return (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {atRiskError}
        </div>
      );
    }

    if (atRiskTrainees.length === 0) {
      return (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
            <AlertTriangle className="size-5 text-emerald-500" />
          </div>
          <p className="text-sm font-medium">{t("atRisk.emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("atRisk.emptyDescription")}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {atRiskTrainees.map((trainee) => {
          const activePlan = trainee.plans?.find((plan) => plan.status === "ACTIVE") ?? trainee.plans?.[0];
          const adherence = activePlan?.adherencePercentage ?? 0;
          const initials = trainee.traineeName
            .split(" ")
            .map((name) => name[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <button
              key={trainee.traineeId}
              type="button"
              onClick={() => router.push(ROUTES.TRAINER.TRAINEE_DETAILS(trainee.traineeId))}
              className="group flex w-full items-center gap-4 rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{trainee.traineeName}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {activePlan?.template?.templateName || t("atRisk.noPlan")}
                </p>
              </div>
              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-sm font-semibold">{Math.round(adherence)}%</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("atRisk.adherence")}</p>
              </div>
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <span className="size-2 rounded-full bg-rose-500" />
                <span className="text-xs font-medium">{t("atRisk.status")}</span>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Score Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <WidgetErrorBoundary widgetId="trainees-count">
          <ScoreCardWidget
            data={{
              titleKey: "cards.trainees",
              value: dashboard.traineesCount,
              iconName: "users",
            }}
          />
        </WidgetErrorBoundary>

        <WidgetErrorBoundary widgetId="active-plans-count">
          <ScoreCardWidget
            data={{
              titleKey: "cards.activePlans",
              value: dashboard.activePlansCount,
              iconName: "activity",
            }}
          />
        </WidgetErrorBoundary>

        <WidgetErrorBoundary widgetId="average-adherence">
          <ScoreCardWidget
            data={{
              titleKey: "cards.averageAdherence",
              value: `${dashboard.avgActivePlansAdherence}%`,
              iconName: "check-circle",
            }}
          />
        </WidgetErrorBoundary>

        <WidgetErrorBoundary widgetId="completed-plans-count">
          <ScoreCardWidget
            data={{
              titleKey: "cards.completedPlans",
              value: dashboard.completedPlansCount,
              iconName: "check-circle",
            }}
          />
        </WidgetErrorBoundary>
      </div>

      {/* Trainees Requiring Attention */}
      <WidgetErrorBoundary widgetId="at-risk-trainees">
        <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
                <AlertTriangle className="size-5 text-rose-500" />
              </div>

              <div>
                  <h2 className="text-base font-semibold">{t("atRisk.title")}</h2>

                <p className="mt-1 text-sm text-muted-foreground">{t("atRisk.description")}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(ROUTES.TRAINER.TRAINEES)
              }
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t("atRisk.viewAll")}
              <ArrowRight className="size-4" />
            </button>
          </div>

          {renderAtRiskContent()}
        </section>
      </WidgetErrorBoundary>

      {/* Weekly Activity */}
      <WidgetErrorBoundary widgetId="weekly-activity">
        <ChartWidget data={chartData} />
      </WidgetErrorBoundary>
    </div>
  );
}