"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";

import ProgramsHistoryTable from "../components/programs/ProgramHistoryTable";
import type { ProgramHistoryRow } from "../components/programs/ProgramHistoryTable";

import WorkoutHistoryDialog from "../components/programs/WorkoutHistoryDialog";
import WorkoutSessionDetailsDialog from "../components/programs/WorkoutSessionDetailsDialog";
import EditProgramAssignmentDialog from "../components/programs/EditProgramAssignmentDialog";

import type {
  WorkoutLog,
  WorkoutLogDetail,
} from "../types/workoutLog.types";

import { useProgramsHistory } from "../hooks/useProgramHistory";
import { programService } from "../services/program.service";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

export default function ProgramsView() {
  const {
    rows,
    templateOptions,
    isLoading,
    error,
    refresh,
  } = useProgramsHistory();

  const [selectedTemplate, setSelectedTemplate] =
    useState<string>("all");

  const [rowToRemove, setRowToRemove] =
    useState<ProgramHistoryRow | null>(null);

  const [isRemoving, setIsRemoving] =
    useState(false);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [selectedProgram, setSelectedProgram] =
    useState<ProgramHistoryRow | null>(null);

  const [workoutLogs, setWorkoutLogs] =
    useState<WorkoutLog[]>([]);

  const [workoutNames, setWorkoutNames] =
    useState<Record<number, string>>({});

  const [isLoadingLogs, setIsLoadingLogs] =
    useState(false);

  const [logsError, setLogsError] =
    useState<string | null>(null);

  const [selectedWorkoutLog, setSelectedWorkoutLog] =
    useState<WorkoutLogDetail | null>(null);

  const [isLoadingLogDetail, setIsLoadingLogDetail] =
    useState(false);

  const [logDetailError, setLogDetailError] =
    useState<string | null>(null);

  const [rowToEdit, setRowToEdit] =
    useState<ProgramHistoryRow | null>(null);

  const filteredRows = useMemo(() => {
    if (selectedTemplate === "all") {
      return rows;
    }

    return rows.filter(
      (row) =>
        String(row.templateId) === selectedTemplate,
    );
  }, [rows, selectedTemplate]);

  /*
   * Load workout history for the selected trainee/program.
   *
   * Important:
   * We only show logs belonging to this exact assignment.
   * The relationship is:
   *
   * assignment.id === log.planAssignmentId
   */
  const handleRowClick = async (
    row: ProgramHistoryRow,
  ) => {
    setSelectedProgram(row);
    setWorkoutLogs([]);
    setWorkoutNames({});
    setLogsError(null);
    setSelectedWorkoutLog(null);
    setLogDetailError(null);
    setIsLoadingLogs(true);

    try {
      const response =
        await programService.getWorkoutLogs(
          row.traineeId,
        );

      const logs: WorkoutLog[] =
        response.data?.data ?? [];

      const assignmentLogs = logs.filter(
        (log) =>
          Number(log.planAssignmentId) ===
          Number(row.id),
      );

      const uniqueWorkoutIds = [
        ...new Set(
          assignmentLogs.map(
            (log) => log.workoutTemplateId,
          ),
        ),
      ];

      const workoutDetails = await Promise.all(
        uniqueWorkoutIds.map(async (workoutId) => {
          try {
            const workoutResponse =
              await programService.getWorkoutDetail(
                workoutId,
              );

            return {
              id: workoutId,
              name:
                workoutResponse.data?.data?.name ??
                `Workout ${workoutId}`,
            };
          } catch (error) {
            console.error(
              `Failed to fetch workout ${workoutId}:`,
              error,
            );

            return {
              id: workoutId,
              name: `Workout ${workoutId}`,
            };
          }
        }),
      );

      const names: Record<number, string> = {};

      workoutDetails.forEach((workout) => {
        names[workout.id] = workout.name;
      });

      setWorkoutLogs(assignmentLogs);
      setWorkoutNames(names);
    } catch (error) {
      console.error(
        "Failed to fetch workout logs:",
        error,
      );

      setLogsError(
        "Failed to load workout history.",
      );
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleWorkoutLogClick = async (
    log: WorkoutLog,
  ) => {
    setSelectedWorkoutLog(null);
    setLogDetailError(null);
    setIsLoadingLogDetail(true);

    try {
      const response =
        await programService.getWorkoutLogDetail(
          log.workoutLogId,
        );

      const detail: WorkoutLogDetail =
        response.data?.data;

      setSelectedWorkoutLog(detail);
    } catch (error) {
      console.error(
        "Failed to fetch workout log details:",
        error,
      );

      setLogDetailError(
        "Failed to load workout session details.",
      );
    } finally {
      setIsLoadingLogDetail(false);
    }
  };

  const handleRemoveAssignment = async () => {
    if (!rowToRemove) {
      return;
    }

    setIsRemoving(true);
    setActionError(null);

    try {
      await programService.deleteAssignment(
        rowToRemove.id,
      );

      setRowToRemove(null);

      await refresh();
    } catch (error) {
      console.error(
        "Failed to remove program assignment:",
        error,
      );

      setActionError(
        "Failed to remove program assignment.",
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />

        <Select
          value={selectedTemplate}
          onValueChange={setSelectedTemplate}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Filter by template" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Templates
            </SelectItem>

            {templateOptions.map((template) => (
              <SelectItem
                key={template.id}
                value={String(template.id)}
              >
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Programs table */}
      <ProgramsHistoryTable
        rows={filteredRows}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        onEdit={(row) => setRowToEdit(row)}
        onRemove={(row) => {
          setRowToRemove(row);
          setActionError(null);
        }}
      />

      {/* Edit assignment */}
      <EditProgramAssignmentDialog
        open={rowToEdit !== null}
        row={rowToEdit}
        onClose={() => setRowToEdit(null)}
      />

      {/* Remove assignment */}
      <Dialog
        open={rowToRemove !== null}
        onOpenChange={(open) => {
          if (!open && !isRemoving) {
            setRowToRemove(null);
            setActionError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Remove Program Assignment
            </DialogTitle>

            <DialogDescription>
              Are you sure you want to remove this
              program assignment?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">
                Trainee:
              </span>{" "}
              {rowToRemove?.traineeName}
            </p>

            <p className="text-sm">
              <span className="font-medium">
                Program:
              </span>{" "}
              {rowToRemove?.templateName}
            </p>

            {actionError && (
              <p className="text-sm text-destructive">
                {actionError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isRemoving}
              onClick={() => {
                setRowToRemove(null);
                setActionError(null);
              }}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={isRemoving}
              onClick={handleRemoveAssignment}
            >
              {isRemoving ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workout history */}
      <WorkoutHistoryDialog
        open={selectedProgram !== null}
        selectedProgram={selectedProgram}
        workoutLogs={workoutLogs}
        workoutNames={workoutNames}
        isLoadingLogs={isLoadingLogs}
        logsError={logsError}
        onClose={() => {
          setSelectedProgram(null);
          setWorkoutLogs([]);
          setWorkoutNames({});
          setLogsError(null);
        }}
        onWorkoutLogClick={handleWorkoutLogClick}
      />

      {/* Workout session details */}
      <WorkoutSessionDetailsDialog
        open={selectedWorkoutLog !== null}
        selectedWorkoutLog={selectedWorkoutLog}
        isLoading={isLoadingLogDetail}
        error={logDetailError}
        onClose={() => {
          setSelectedWorkoutLog(null);
          setLogDetailError(null);
        }}
      />
    </div>
  );
}