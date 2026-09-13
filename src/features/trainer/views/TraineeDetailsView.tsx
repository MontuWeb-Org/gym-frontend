"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, MessageSquare, Edit3, Loader2 } from "lucide-react";
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

interface TraineeDetailsViewProps {
  traineeId: number;
}

type ActiveTab = "overview" | "history" | "charts" | "notes";

export function TraineeDetailsView({ traineeId }: TraineeDetailsViewProps) {
  const t = useTranslations("TraineeDetails");
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

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

  if (isLoading && !data) {
    return (
      <div className="flex h-96 w-full items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-sm font-medium text-destructive">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const joinedMonthYear = new Date(data.joinedAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="w-full space-y-6 p-6">
      {/* Back Link */}
      <div>
        <Link
          href="/trainer/trainees"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("backToTrainees")}
        </Link>
      </div>

      {/* Header Profile Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-border bg-muted">
            <AvatarFallback className="text-lg font-semibold text-muted-foreground">
              {data.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{data.name}</h1>
            <p className="text-sm text-muted-foreground">
              {t("joinedPrefix")} {joinedMonthYear} · {data.programName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 border-border bg-card text-foreground hover:bg-muted"
          >
            <MessageSquare className="h-4 w-4" />
            {t("message")}
          </Button>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Edit3 className="h-4 w-4" />
            {t("editProgram")}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          {[
            { id: "overview", label: t("tabs.overview") },
            { id: "history", label: t("tabs.sessionHistory") },
            { id: "charts", label: t("tabs.progressCharts") },
            { id: "notes", label: t("tabs.notes") },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? "border-foreground text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-5 text-center shadow-xs">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                {t("metrics.adherence")}
              </span>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {data.adherence}%
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 text-center shadow-xs">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                {t("metrics.streak")}
              </span>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {data.streakWeeks ?? 0}w
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 text-center shadow-xs">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                {t("metrics.topLiftPr")}
              </span>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {data.topLiftPr ?? "—"}
              </p>
            </div>
          </div>

          {/* Recent Sessions Card */}
          <div className="rounded-lg border border-border bg-card shadow-xs">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {t("recentSessions.title")}
              </h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="w-[140px] text-xs font-semibold uppercase text-muted-foreground">
                    {t("recentSessions.date")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                    {t("recentSessions.session")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                    {t("recentSessions.completed")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                    {t("recentSessions.notes")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentSessions && data.recentSessions.length > 0 ? (
                  data.recentSessions.map((session) => (
                    <TableRow
                      key={session.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <TableCell className="text-sm text-foreground">
                        {session.date}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {session.sessionName}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {session.completedSets}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {session.notes ? `"${session.notes}"` : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      {t("recentSessions.empty")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Session history view
        </div>
      )}

      {activeTab === "charts" && (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Progress charts view
        </div>
      )}

      {activeTab === "notes" && (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Trainee notes view
        </div>
      )}
    </div>
  );
}