"use client";

import { useLocale, useTranslations } from "next-intl";
import { Trash2, Loader2, RotateCw, ExternalLink } from "lucide-react";
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
import { getLastActiveLabel } from "./trainee-table.utils";

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
  const locale = useLocale();

  const avgAdherence =
    trainee.plans?.length > 0
      ? Math.round(
          trainee.plans.reduce(
            (acc, p) => acc + (p.adherencePercentage || 0),
            0
          ) / trainee.plans.length
        )
      : null;

  const initials = trainee.traineeName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const lastActiveLabel = getLastActiveLabel(trainee, locale);

  return (
    <TableRow className="border-b border-border/60 transition-colors hover:bg-muted/30">
      <TableCell>
        <div className="flex items-center justify-center gap-3 text-center">
          <Avatar className="h-9 w-9 border border-primary/20 bg-muted">
            <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-center gap-3 text-center">
          <div className="flex flex-col items-start text-start">
            <span className="text-lg font-bold text-foreground">
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

      <TableCell className="text-center">
        {avgAdherence !== null ? (
          <span className="font-mono text-lg font-semibold text-foreground">
            {avgAdherence}%
          </span>
        ) : (
          <span className="text-lg text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell className="text-center">
        <span className="text-lg text-muted-foreground">{lastActiveLabel}</span>
      </TableCell>

      <TableCell className="text-center">
        <TraineeStatusBadge status={trainee.traineeStatus} />
      </TableCell>

      <TableCell className="justify-center text-center">
        <div className="flex items-center justify-center gap-2">
          {trainee.traineeStatus === "NOT_STARTED" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResend?.(trainee.traineeId)}
              className="h-8 font-heading uppercase text-md tracking-wider"
            >
              <RotateCw className="me-1.5 h-3.5 w-3.5 text-muted-foreground" />
              {t("actions.resend")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpen?.(trainee.traineeId)}
              className="h-8 font-heading uppercase text-md tracking-wider"
            >
              <ExternalLink className="me-1.5 h-3.5 w-3.5 text-muted-foreground" />
              {t("actions.open")}
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isDeleting}
                className="h-8 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span className="sr-only">{t("actions.delete")}</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader className="text-start">
                <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deleteDialog.description", {
                    name: trainee.traineeName,
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
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