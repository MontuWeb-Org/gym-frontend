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

export interface ProgramHistoryRow {
  id: number;
  traineeId: number;
  traineeName: string;
  templateId: number;
  templateName: string;
  createdAt: string;
  endedAt: string;
}

interface ProgramsHistoryTableProps {
  rows: ProgramHistoryRow[];
  isLoading?: boolean;
  onRowClick?: (row: ProgramHistoryRow) => void;
  onRemove?: (row: ProgramHistoryRow) => void;
}

export default function ProgramsHistoryTable({
  rows,
  isLoading = false,
  onRowClick,
  onRemove,
}: ProgramsHistoryTableProps) {
  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDuration = (
    createdAt: string,
    endedAt: string
  ) => {
    const start = new Date(createdAt).getTime();
    const end = new Date(endedAt).getTime();

    if (!start || !end || end <= start) return "-";

    const weeks = Math.round(
      (end - start) / (7 * 24 * 60 * 60 * 1000)
    );

    return `${weeks} ${
      weeks === 1 ? "week" : "weeks"
    }`;
  };

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trainee</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                Loading programs...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                No program assignments found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className={
                  onRowClick
                    ? "cursor-pointer hover:bg-muted/50"
                    : ""
                }
                onClick={() => onRowClick?.(row)}
              >
                <TableCell className="font-medium">
                  {row.traineeName}
                </TableCell>

                <TableCell>
                  {row.templateName}
                </TableCell>

                <TableCell>
                  {formatDate(row.createdAt)}
                </TableCell>

                <TableCell>
                  {formatDate(row.endedAt)}
                </TableCell>

                <TableCell>
                  {getDuration(
                    row.createdAt,
                    row.endedAt
                  )}
                </TableCell>

                <TableCell>
                  <div
                    className="flex justify-end gap-2"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                    {onRemove && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemove(row)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}