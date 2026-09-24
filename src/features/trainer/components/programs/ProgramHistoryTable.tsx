"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export interface ProgramHistoryRow {
  id: number;
  traineeId: number;
  traineeName: string;
  templateId: number;
  templateName: string;
  durationWeeks: number;
  startedAt: string | null;
  endedAt: string | null;
}

interface ProgramsHistoryTableProps {
  rows: ProgramHistoryRow[];
  isLoading: boolean;
  onRowClick: (
    row: ProgramHistoryRow
  ) => void;
  onEdit: (
    row: ProgramHistoryRow
  ) => void;
  onRemove: (
    row: ProgramHistoryRow
  ) => void;
}

const formatDate = (
  date: string | null
) => {
  if (!date) {
    return "-";
  }

  const value = new Date(date);

  if (
    Number.isNaN(
      value.getTime()
    )
  ) {
    return "-";
  }

  return value.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
};

const formatDuration = (
  weeks: number
) => {
  if (!weeks || weeks <= 0) {
    return "-";
  }

  return `${weeks} ${
    weeks === 1
      ? "week"
      : "weeks"
  }`;
};

export default function ProgramsHistoryTable({
  rows,
  isLoading,
  onRowClick,
  onEdit,
  onRemove,
}: ProgramsHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading programs...
        </p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-lg border">
        <p className="text-sm text-muted-foreground">
          No program assignments found.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              Trainee
            </TableHead>

            <TableHead>
              Program
            </TableHead>

            <TableHead>
              Duration
            </TableHead>

            <TableHead>
              Start Date
            </TableHead>

            <TableHead>
              End Date
            </TableHead>

            <TableHead className="w-[100px] text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer"
              onClick={() =>
                onRowClick(row)
              }
            >
              <TableCell className="font-medium">
                {row.traineeName}
              </TableCell>

              <TableCell>
                {row.templateName}
              </TableCell>

              <TableCell>
                {formatDuration(
                  row.durationWeeks
                )}
              </TableCell>

              <TableCell>
                {formatDate(
                  row.startedAt
                )}
              </TableCell>

              <TableCell>
                {formatDate(
                  row.endedAt
                )}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(row);
                    }}
                    aria-label={`Edit ${row.templateName} for ${row.traineeName}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemove(row);
                    }}
                    aria-label={`Remove ${row.templateName} from ${row.traineeName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

