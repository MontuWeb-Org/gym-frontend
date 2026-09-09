"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trainee, TraineeStatus } from "../types/trainer.types";

interface TraineesTableProps {
  trainees: Trainee[];
  totalCount?: number;
  isLoading?: boolean;
  onInvite?: () => void;
  onOpenTrainee?: (id: number) => void;
  onResendInvite?: (id: number) => void;
}

type FilterTab = "ALL" | "ACTIVE" | "FALLING_BEHIND" | "PENDING_INVITE";

export function TraineesTable({
  trainees = [],
  totalCount = 0,
  isLoading = false,
  onInvite,
  onOpenTrainee,
  onResendInvite,
}: TraineesTableProps) {
  const t = useTranslations("TraineesTable");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  const filteredTrainees = trainees.filter((trainee) => {
    const matchesSearch = trainee.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "ACTIVE")
      return trainee.status === "ON_TRACK" || trainee.status === "AT_RISK";
    if (activeTab === "FALLING_BEHIND")
      return trainee.status === "FALLING_BEHIND";
    if (activeTab === "PENDING_INVITE")
      return trainee.status === "INVITE_PENDING";

    return true;
  });

  const renderStatus = (status: TraineeStatus) => {
    switch (status) {
      case "ON_TRACK":
        return (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="size-2 rounded-full bg-success" />
            {t("status.onTrack")}
          </span>
        );
      case "AT_RISK":
        return (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="size-2 rounded-full bg-warning" />
            {t("status.atRisk")}
          </span>
        );
      case "INVITE_PENDING":
        return (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="size-2 rounded-full bg-warning/60" />
            {t("status.invitePending")}
          </span>
        );
      case "FALLING_BEHIND":
        return (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="size-2 rounded-full bg-destructive" />
            {t("status.fallingBehind")}
          </span>
        );
    }
  };

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "ALL", label: t("tabs.all") },
    { id: "ACTIVE", label: t("tabs.active") },
    { id: "FALLING_BEHIND", label: t("tabs.fallingBehind") },
    { id: "PENDING_INVITE", label: t("tabs.pendingInvite") },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("title")}{" "}
          <span className="font-normal text-muted-foreground">
            ({totalCount})
          </span>
        </h1>
        <Button
          onClick={onInvite}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> {t("inviteTrainee")}
        </Button>
      </div>

      {/* Search + Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card pl-9 text-card-foreground border-border focus-visible:ring-ring rtl:pl-3 rtl:pr-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-border bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                }`}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border border-border bg-card text-card-foreground shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="w-[280px] text-xs font-semibold uppercase text-muted-foreground">
                {t("columns.name")}
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                {t("columns.program")}
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                {t("columns.adherence")}
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                {t("columns.lastActive")}
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                {t("columns.status")}
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground rtl:text-left">
                {t("columns.action")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-b border-border">
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t("states.loading")}
                </TableCell>
              </TableRow>
            ) : filteredTrainees.length === 0 ? (
              <TableRow className="border-b border-border">
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t("states.empty")}
                </TableCell>
              </TableRow>
            ) : (
              filteredTrainees.map((trainee) => (
                <TableRow
                  key={trainee.id}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border border-border bg-muted">
                        <AvatarFallback className="text-xs font-medium text-muted-foreground">
                          {trainee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-foreground">{trainee.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {trainee.programName !== "—" ? (
                      <span className="text-foreground">
                        {trainee.programName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {trainee.adherence > 0 ? (
                      <span className="text-foreground">
                        {trainee.adherence}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {trainee.lastSessionDate !== "—" ? (
                      <span className="text-foreground">
                        {trainee.lastSessionDate}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>{renderStatus(trainee.status)}</TableCell>

                  <TableCell className="text-right rtl:text-left">
                    {trainee.status === "INVITE_PENDING" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResendInvite?.(trainee.id)}
                        className="h-8 border-dashed border-border bg-card text-xs text-foreground hover:bg-muted"
                      >
                        {t("actions.resend")}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenTrainee?.(trainee.id)}
                        className="h-8 border-border bg-card text-xs text-foreground hover:bg-muted"
                      >
                        {t("actions.open")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}