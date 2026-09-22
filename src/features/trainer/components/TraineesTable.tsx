"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trainee } from "../types/trainer.types";
import { TraineeTableRow } from "./TraineeTableRow";
import { FilterTab, TraineeTableFilters, FILTER_TAB_STATUS_MAP } from "./TraineeTableFilters";
import { TraineeCard } from "./TraineeCard";

interface TraineesTableProps {
  trainees: Trainee[];
  totalCount?: number;
  isLoading?: boolean;
  onInvite?: () => void;
  onOpenTrainee?: (id: number) => void;
  onResendInvite?: (id: number) => void;
  onDeleteTrainee?: (id: number) => void;
  deletingTraineeId?: number | null;
}

export function TraineesTable({
  trainees = [],
  totalCount = 0,
  isLoading = false,
  onInvite,
  onOpenTrainee,
  onResendInvite,
  onDeleteTrainee,
  deletingTraineeId,
}: TraineesTableProps) {
  const t = useTranslations("TraineesTable");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  const columns = useMemo(
    () => [
      { key: "avatar", label: t("columns.avatar"), className: "w-[80px] text-center" },
      { key: "name", label: t("columns.name"), className: "w-[280px] text-center" },
      { key: "program", label: t("columns.program"), className: "text-center" },
      { key: "adherence", label: t("columns.adherence"), className: "text-center" },
      { key: "lastActive", label: t("columns.lastActive"), className: "text-center" },
      { key: "status", label: t("columns.status"), className: "text-center" },
      { key: "action", label: t("columns.action"), className: "text-center" },
    ],
    [t]
  );

  const filteredTrainees = useMemo(() => {
    return trainees.filter((trainee) => {
      const matchesSearch = trainee.traineeName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (activeTab === "ALL") return true;

      return FILTER_TAB_STATUS_MAP[activeTab].includes(trainee.traineeStatus);
    });
  }, [trainees, searchQuery, activeTab]);

  return (
    <div className="w-full space-y-6">
      <TraineeTableFilters
        totalCount={totalCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="hidden md:block overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`font-heading text-lg uppercase tracking-wider font-bold text-muted-foreground ${
                    col.className ?? ""
                  }`}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground font-medium"
                >
                  {t("states.loading")}
                </TableCell>
              </TableRow>
            ) : filteredTrainees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground font-medium"
                >
                  {t("states.empty")}
                </TableCell>
              </TableRow>
            ) : (
              filteredTrainees.map((trainee) => (
                <TraineeTableRow
                  key={trainee.traineeId}
                  trainee={trainee}
                  onOpen={onOpenTrainee}
                  onResend={onResendInvite}
                  onDelete={onDeleteTrainee}
                  isDeleting={deletingTraineeId === trainee.traineeId}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {isLoading ? (
          <div className="p-8 text-center rounded-xl border border-border bg-card text-muted-foreground">
            {t("states.loading")}
          </div>
        ) : filteredTrainees.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-border bg-card text-muted-foreground">
            {t("states.empty")}
          </div>
        ) : (
          filteredTrainees.map((trainee) => (
            <TraineeCard
              key={trainee.traineeId}
              trainee={trainee}
              onOpen={onOpenTrainee}
              onResend={onResendInvite}
              onDelete={onDeleteTrainee}
              isDeleting={deletingTraineeId === trainee.traineeId}
            />
          ))
        )}
      </div>
    </div>
  );
}