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

  // Define table columns configuration
  const columns = useMemo(
    () => [
      { key: "name", label: t("columns.name"), className: "w-[280px]" },
      { key: "program", label: t("columns.program") },
      { key: "adherence", label: t("columns.adherence") },
      { key: "lastActive", label: t("columns.lastActive") },
      { key: "status", label: t("columns.status") },
      { key: "action", label: t("columns.action"), className: "text-right rtl:text-left" },
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
        onInvite={onInvite}
      />

      <div className="overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`text-xs font-semibold uppercase text-muted-foreground ${
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
              <TableRow className="border-b border-border">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t("states.loading")}
                </TableCell>
              </TableRow>
            ) : filteredTrainees.length === 0 ? (
              <TableRow className="border-b border-border">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
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
    </div>
  );
}