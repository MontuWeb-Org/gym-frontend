"use client";

import { useTranslations } from "next-intl";
import { Trash2, Loader2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trainee } from "../types/trainer.types";
import { TraineeStatusBadge } from "./TraineeStatusBadge";
import { TraineePlansCell } from "./TraineePlansCell";

interface TraineeTableRowProps {
  trainee: Trainee;
  onOpen?: (id: number) => void;
  onResend?: (id: number) => void;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
}

export function TraineeTableRow({
  trainee,
  onOpen,
  onResend,
  onDelete,
  isDeleting = false,
}: TraineeTableRowProps) {
  const t = useTranslations("TraineesTable");

  const avgAdherence =
    trainee.plans?.length > 0
      ? Math.round(
          trainee.plans.reduce(
            (acc, p) => acc + (p.adherencePercentage || 0),
            0
          ) / trainee.plans.length
        )
      : null;

  const lastSessionDates = trainee.plans
    ?.map((p) => p.lastSession?.startedAt)
    .filter(Boolean) as string[];

  const latestSessionDate =
    lastSessionDates.length > 0
      ? new Date(
          Math.max(...lastSessionDates.map((d) => new Date(d).getTime()))
        ).toLocaleDateString()
      : null;

  const initials = trainee.traineeName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <TableRow className="border-b border-border transition-colors hover:bg-muted/40">
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 border border-border bg-muted">
            <AvatarFallback className="text-xs font-semibold text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {trainee.traineeName}
            </span>
            {trainee.email && (
              <span className="text-xs text-muted-foreground">
                {trainee.email}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <TraineePlansCell plans={trainee.plans} />
      </TableCell>

      <TableCell>
        {avgAdherence !== null ? (
          <span className="text-sm font-medium text-foreground">
            {avgAdherence}%
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell>
        {latestSessionDate ? (
          <span className="text-sm text-foreground">{latestSessionDate}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell>
        <TraineeStatusBadge status={trainee.traineeStatus} />
      </TableCell>

      <TableCell className="text-right rtl:text-left">
        <div className="flex items-center justify-end gap-2 rtl:justify-start">
          {trainee.traineeStatus === "NOT_STARTED" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResend?.(trainee.traineeId)}
              className="h-8 border-dashed border-border bg-card text-xs text-foreground hover:bg-muted"
            >
              {t("actions.resend")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpen?.(trainee.traineeId)}
              className="h-8 border-border bg-card text-xs text-foreground hover:bg-muted"
            >
              {t("actions.open")}
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isDeleting}
                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={t("actions.delete")}
              >
                {isDeleting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deleteDialog.description", {
                    name: trainee.traineeName,
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete?.(trainee.traineeId)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t("deleteDialog.confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}