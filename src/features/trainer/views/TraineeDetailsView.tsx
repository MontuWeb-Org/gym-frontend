"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Edit3, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  fetchTraineeDetails,
  clearSelectedTrainee,
} from "../store/trainer.slice";

import TraineeSessionHistory from "../components/trainee-details/TraineeSessionHistory";

import AnalyticsHeader from "@/features/trainee/components/analytics/AnalyticsHeader";
import ExerciseSelector from "@/features/trainee/components/analytics/ExerciseSelector";
import PersonalRecords from "@/features/trainee/components/analytics/PersonalRecords";
import ProgressionChart from "@/features/trainee/components/analytics/ProgressionChart";

import type { ProgressionEvent } from "@/features/trainee/types/analytics.types";

interface TraineeDetailsViewProps {
  traineeId: number;
}

type ActiveTab = "overview" | "history" | "charts";

export function TraineeDetailsView({
  traineeId,
}: TraineeDetailsViewProps) {
  const t = useTranslations("TraineeDetails");
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] =
    useState<ActiveTab>("overview");

  const [selectedExerciseId, setSelectedExerciseId] =
    useState<number | null>(null);

  const {
    selectedTrainee: data,
    isLoading,
    error,
  } = useAppSelector((state) => state.trainer);

  useEffect(() => {
    dispatch(fetchTraineeDetails(traineeId));

    return () => {
      dispatch(clearSelectedTrainee());
    };
  }, [dispatch, traineeId]);

  const personalRecords = useMemo(
    () => data?.personalRecords ?? [],
    [data?.personalRecords],
  );

  const progression = useMemo(
    () => data?.progression ?? [],
    [data?.progression],
  );

  const exercises = useMemo(() => {
    const exerciseMap = new Map<
      number,
      { id: number; name: string }
    >();

    personalRecords.forEach((record) => {
      exerciseMap.set(
        record.exercise.id,
        record.exercise,
      );
    });

    progression.forEach((event) => {
      exerciseMap.set(
        event.exercise.id,
        event.exercise,
      );
    });

    return Array.from(exerciseMap.values()).sort(
      (a, b) => a.name.localeCompare(b.name),
    );
  }, [personalRecords, progression]);

  const activeExerciseId =
    selectedExerciseId ??
    exercises[0]?.id ??
    null;

  const selectedProgression =
    useMemo<ProgressionEvent[]>(() => {
      if (activeExerciseId === null) {
        return [];
      }

      return progression
        .filter(
          (event) =>
            event.exercise.id ===
            activeExerciseId,
        )
        .sort(
          (a, b) =>
            new Date(a.achievedAt).getTime() -
            new Date(b.achievedAt).getTime(),
        );
    }, [progression, activeExerciseId]);

  // Loading
  if (isLoading && !data) {
    return (
      <div className="flex h-96 w-full items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="p-6 text-center text-sm font-medium text-destructive">
        {error}
      </div>
    );
  }

  // No data
  if (!data) {
    return null;
  }

  const { traineeProfile } = data;

  const initials = traineeProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const topPr = progression
    .filter((p) => p.isOneRmPr)
    .sort(
      (a, b) =>
        new Date(b.achievedAt).getTime() -
        new Date(a.achievedAt).getTime(),
    )[0];

  return (
    <div className="w-full space-y-6 p-6">
      {/* Back */}
      <div>
        <Link
          href="/trainer/trainees"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("backToTrainees")}
        </Link>
      </div>

      {/* Trainee Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-border bg-muted">
            <AvatarFallback className="text-lg font-semibold text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {traineeProfile.name}
            </h1>

            <p className="text-sm text-muted-foreground">
              {traineeProfile.email}
            </p>
          </div>
        </div>

        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Edit3 className="h-4 w-4" />
          {t("editProgram")}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav
          className="-mb-px flex gap-6"
          aria-label="Tabs"
        >
          {[
            {
              id: "overview",
              label: t("tabs.overview"),
            },
            {
              id: "history",
              label: t("tabs.sessionHistory"),
            },
            {
              id: "charts",
              label: t("tabs.progressCharts"),
            },
          ].map((tab) => {
            const isActive =
              activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(
                    tab.id as ActiveTab,
                  )
                }
                className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-foreground font-semibold text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5 text-center shadow-xs">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                {t("metrics.personalRecords")}
              </span>

              <p className="mt-2 text-2xl font-bold text-foreground">
                {personalRecords.length}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 text-center shadow-xs">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                {t("metrics.latestPr")}
              </span>

              <p className="mt-2 text-2xl font-bold text-foreground">
                {topPr
                  ? `${topPr.exercise.name} · ${topPr.estimatedOneRm}`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card shadow-xs">
            <div className="border-b border-border p-4">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {t("personalRecords.title")}
              </h2>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                    {t("personalRecords.exercise")}
                  </TableHead>

                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                    {t("personalRecords.heaviestWeight")}
                  </TableHead>

                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                    {t("personalRecords.estimatedOneRm")}
                  </TableHead>

                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                    {t("personalRecords.updatedAt")}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {personalRecords.length > 0 ? (
                  personalRecords.map((pr) => (
                    <TableRow
                      key={pr.exercise.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <TableCell className="text-sm text-foreground">
                        {pr.exercise.name}
                      </TableCell>

                      <TableCell className="text-sm text-foreground">
                        {pr.heaviestWeight}
                      </TableCell>

                      <TableCell className="text-sm text-foreground">
                        {pr.estimatedOneRm}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(
                          pr.updatedAt,
                        ).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      {t(
                        "personalRecords.empty",
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Session History */}
      {activeTab === "history" && (
        <TraineeSessionHistory
          traineeId={traineeId}
        />
      )}

      {/* Progress Charts */}
      {activeTab === "charts" && (
        <div className="w-full max-w-full min-w-0 space-y-8">
          <AnalyticsHeader
            exerciseCount={exercises.length}
            personalRecordCount={
              personalRecords.length
            }
            title="Trainee Progress"
            description="Track this trainee's personal records and PR history."
          />

          <PersonalRecords
            records={personalRecords}
            title="Personal Records"
            description="This trainee's current best performance for each exercise."
          />

          <section className="w-full max-w-full min-w-0 space-y-4">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  PR Progression
                </h2>
              </div>

              <ExerciseSelector
                exercises={exercises}
                selectedExerciseId={
                  activeExerciseId
                }
                onChange={
                  setSelectedExerciseId
                }
              />
            </div>

            <div className="w-full max-w-full min-w-0">
              <ProgressionChart
                events={selectedProgression}
                title="Estimated 1RM PR History"
                description="How this trainee's estimated 1RM has changed across personal records."
                singleEventDescription="This trainee's personal record history for this exercise."
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}