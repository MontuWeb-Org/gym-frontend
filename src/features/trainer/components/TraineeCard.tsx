"use client";

import { useTranslations } from "next-intl";
import { Trash2, Loader2, RotateCw, ExternalLink } from "lucide-react";
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

interface TraineeCardProps {
  trainee: Trainee;
  onOpen?: (id: number) => void;
  onResend?: (id: number) => void;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
}

export function TraineeCard({
  trainee,
  onOpen,
  onResend,
  onDelete,
  isDeleting = false,
}: TraineeCardProps) {
  const t = useTranslations("TraineesTable");

  const initials = trainee.traineeName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 space-y-4 shadow-sm text-start">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-primary/20 bg-muted">
            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-base font-bold text-foreground">
              {trainee.traineeName}
            </span>
            {trainee.email && (
              <span className="text-xs text-muted-foreground">{trainee.email}</span>
            )}
          </div>
        </div>
        <TraineeStatusBadge status={trainee.traineeStatus} />
      </div>

      <div className="border-t border-border/60 pt-3">
        <p className="text-xs uppercase font-heading font-bold text-muted-foreground mb-1">
          {t("columns.program")}
        </p>
        <TraineePlansCell plans={trainee.plans} variant="card" />
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3 gap-3">
        <Button
            variant="outline"
            size="sm"
            onClick={() => onResend?.(trainee.traineeId)}
            className="flex-1 h-8 font-heading uppercase border-foreground/50 text-md tracking-wider hover:bg-foreground/80 hover:text-background transition-colors"
          >
            {trainee.traineeStatus === "NOT_STARTED" ? (
              <>
                <RotateCw className="me-1.5 h-3.5 w-3.5" />
                {t("actions.resend")}
              </>
            ) : (
              <>
                <ExternalLink className="me-1.5 h-3.5 w-3.5" />
                {t("actions.open")}
              </>
            )}
          </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                className="flex-1 h-8 font-heading uppercase text-md tracking-wider border-destructive/30 text-destructive hover:bg-destructive hover:text-background">
                {isDeleting ? (
                  <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="me-1.5 h-3.5 w-3.5" />
                )}
                {t("actions.delete")}
              </Button>
            </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader className="text-start">
              <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("deleteDialog.description", { name: trainee.traineeName })}
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
    </div>
  );
}