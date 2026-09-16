"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";

import ProgramsHistoryTable, {
  ProgramHistoryRow,
} from "../components/programs/ProgramHistoryTable";
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
    useState<string>("ALL");

  const [selectedRow, setSelectedRow] =
    useState<ProgramHistoryRow | null>(null);

  const [durationWeeks, setDurationWeeks] =
    useState<string>("4");

  const [rowToRemove, setRowToRemove] =
    useState<ProgramHistoryRow | null>(null);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [isRemoving, setIsRemoving] =
    useState(false);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const filteredRows = useMemo(() => {
    if (selectedTemplate === "ALL") {
      return rows;
    }

    return rows.filter(
      (row) =>
        String(row.templateId) === selectedTemplate
    );
  }, [rows, selectedTemplate]);

  const getDurationWeeks = (
    createdAt: string,
    endedAt: string
  ) => {
    const start = new Date(createdAt).getTime();
    const end = new Date(endedAt).getTime();

    if (!start || !end || end <= start) {
      return 4;
    }

    return Math.max(
      1,
      Math.round(
        (end - start) /
          (7 * 24 * 60 * 60 * 1000)
      )
    );
  };

  const handleRowClick = (
    row: ProgramHistoryRow
  ) => {
    console.log(
      "Selected program assignment:",
      row
    );
  };

  const handleUpdateDuration = (
    row: ProgramHistoryRow
  ) => {
    setActionError(null);
    setSelectedRow(row);

    setDurationWeeks(
      String(
        getDurationWeeks(
          row.createdAt,
          row.endedAt
        )
      )
    );
  };

  const handleConfirmUpdateDuration =
    async () => {
      if (!selectedRow) return;

      const weeks = Number(durationWeeks);

      if (!Number.isInteger(weeks) || weeks < 1) {
        setActionError(
          "Duration must be at least 1 week."
        );
        return;
      }

      try {
        setIsUpdating(true);
        setActionError(null);

        const start = new Date(
          selectedRow.createdAt
        );

        const endedAt = new Date(
          start.getTime() +
            weeks *
              7 *
              24 *
              60 *
              60 *
              1000
        ).toISOString();

        await programService.updateAssignment(
          selectedRow.id,
          {
            endedAt,
          }
        );

        setSelectedRow(null);
        refresh();
      } catch (err) {
        console.error(
          "Failed to update duration:",
          err
        );

        setActionError(
          "Failed to update program duration."
        );
      } finally {
        setIsUpdating(false);
      }
    };

  const handleRemove = (
    row: ProgramHistoryRow
  ) => {
    setActionError(null);
    setRowToRemove(row);
  };

  const handleConfirmRemove =
    async () => {
      if (!rowToRemove) return;

      try {
        setIsRemoving(true);
        setActionError(null);

        await programService.deleteAssignment(
          rowToRemove.id
        );

        setRowToRemove(null);
        refresh();
      } catch (err) {
        console.error(
          "Failed to remove assignment:",
          err
        );

        setActionError(
          "Failed to remove program assignment."
        );
      } finally {
        setIsRemoving(false);
      }
    };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />

            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by template" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">
                  All Templates
                </SelectItem>

                {templateOptions.map(
                  (template) => (
                    <SelectItem
                      key={template.id}
                      value={String(
                        template.id
                      )}
                    >
                      {template.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </div>
        ) : (
          <ProgramsHistoryTable
            rows={filteredRows}
            isLoading={isLoading}
            onRowClick={handleRowClick}
            onUpdateDuration={
              handleUpdateDuration
            }
            onRemove={handleRemove}
          />
        )}
      </div>

      {/* Update Duration Dialog */}
      <Dialog
        open={selectedRow !== null}
        onOpenChange={(open) => {
          if (!open && !isUpdating) {
            setSelectedRow(null);
            setActionError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Update Program Duration
            </DialogTitle>

            <DialogDescription>
              Update the duration of{" "}
              <strong>
                {selectedRow?.templateName}
              </strong>{" "}
              for{" "}
              <strong>
                {selectedRow?.traineeName}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium">
              Duration
            </label>

            <Select
              value={durationWeeks}
              onValueChange={setDurationWeeks}
              disabled={isUpdating}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="1">
                  1 week
                </SelectItem>

                <SelectItem value="2">
                  2 weeks
                </SelectItem>

                <SelectItem value="4">
                  4 weeks
                </SelectItem>

                <SelectItem value="6">
                  6 weeks
                </SelectItem>

                <SelectItem value="8">
                  8 weeks
                </SelectItem>

                <SelectItem value="12">
                  12 weeks
                </SelectItem>

                <SelectItem value="16">
                  16 weeks
                </SelectItem>
              </SelectContent>
            </Select>

            {actionError && (
              <p className="mt-2 text-sm text-destructive">
                {actionError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setSelectedRow(null)
              }
              disabled={isUpdating}
            >
              Cancel
            </Button>

            <Button
              onClick={
                handleConfirmUpdateDuration
              }
              disabled={isUpdating}
            >
              {isUpdating
                ? "Updating..."
                : "Update Duration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
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
              Are you sure you want to remove the{" "}
              <strong>
                {rowToRemove?.templateName}
              </strong>{" "}
              assignment from{" "}
              <strong>
                {rowToRemove?.traineeName}
              </strong>
              ? This will remove this assignment
              from the program history.
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <p className="text-sm text-destructive">
              {actionError}
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRowToRemove(null)
              }
              disabled={isRemoving}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleConfirmRemove}
              disabled={isRemoving}
            >
              {isRemoving
                ? "Removing..."
                : "Remove Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}