"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";

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
  onViewLogs?: (row: ProgramHistoryRow) => void;
  onRowClick?: (row: ProgramHistoryRow) => void; // Fallback for backward compatibility
  onEdit: (row: ProgramHistoryRow) => void;
  onRemove: (row: ProgramHistoryRow) => void;
}

const formatDate = (date: string | null) => {
  if (!date) {
    return "-";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "-";
  }

  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDuration = (weeks: number) => {
  if (!weeks || weeks <= 0) {
    return "-";
  }

  return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
};

export default function ProgramsHistoryTable({
  rows,
  isLoading,
  onViewLogs,
  onRowClick,
  onEdit,
  onRemove,
}: ProgramsHistoryTableProps) {
  const handleViewLogs = (row: ProgramHistoryRow) => {
    if (onViewLogs) {
      onViewLogs(row);
    } else if (onRowClick) {
      onRowClick(row);
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card p-8 text-center text-muted-foreground shadow-sm font-medium">
        Loading programs...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card p-8 text-center text-muted-foreground shadow-sm font-medium">
        No program assignments found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              {/* Avatar Header */}
              <TableHead className="w-[80px] text-center font-heading text-lg font-bold uppercase tracking-wider text-muted-foreground">
                Avatar
              </TableHead>

              <TableHead className="text-center font-heading text-lg font-bold uppercase tracking-wider text-muted-foreground">
                Trainee
              </TableHead>

              <TableHead className="text-center font-heading text-lg font-bold uppercase tracking-wider text-muted-foreground">
                Program
              </TableHead>

              <TableHead className="text-center font-heading text-lg font-bold uppercase tracking-wider text-muted-foreground">
                Duration
              </TableHead>

              <TableHead className="text-center font-heading text-lg font-bold uppercase tracking-wider text-muted-foreground">
                Start Date
              </TableHead>

              <TableHead className="text-center font-heading text-lg font-bold uppercase tracking-wider text-muted-foreground">
                End Date
              </TableHead>

              <TableHead className="text-center font-heading text-lg font-bold uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((row) => {
              const initials = (row.traineeName || "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <TableRow
                  key={row.id}
                  className="border-b border-border/60 transition-colors hover:bg-muted/30"
                >
                  {/* Avatar Cell */}
                  <TableCell>
                    <div className="flex items-center justify-center gap-3 text-center">
                      <Avatar className="h-9 w-9 border border-primary/20 bg-muted">
                        <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </TableCell>

                  <TableCell className="text-center text-lg font-bold text-foreground">
                    {row.traineeName}
                  </TableCell>

                  <TableCell className="text-center font-medium text-foreground">
                    {row.templateName}
                  </TableCell>

                  <TableCell className="text-center font-mono text-muted-foreground">
                    {formatDuration(row.durationWeeks)}
                  </TableCell>

                  <TableCell className="text-center text-muted-foreground">
                    {formatDate(row.startedAt)}
                  </TableCell>

                  <TableCell className="text-center text-muted-foreground">
                    {formatDate(row.endedAt)}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2 px-2">
                      {/* View Logs Action Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewLogs(row)}
                        className="h-8 font-heading text-md tracking-wider border-foreground/50 hover:bg-foreground/80 hover:text-background transition-colors"
                      >
                        <Eye className="me-1.5 h-3.5 w-3.5" />
                        View Logs
                      </Button>

                      {/* Edit Action Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(row)}
                        aria-label={`Edit ${row.templateName} for ${row.traineeName}`}
                        className="h-8 font-heading text-md tracking-wider border-foreground/50 hover:bg-foreground/80 hover:text-background transition-colors"
                      >
                        <Pencil className="me-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>

                      {/* Delete Action Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRemove(row)}
                        aria-label={`Remove ${row.templateName} from ${row.traineeName}`}
                        className="h-8 font-heading text-md tracking-wider border-destructive/30 text-destructive hover:bg-destructive hover:text-background"
                      >
                        <Trash2 className="me-1.5 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}