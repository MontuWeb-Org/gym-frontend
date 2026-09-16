"use client";

import { useTranslations } from "next-intl";

interface AcceptInvitationProps {
  trainerName?: string;
  isLoading: boolean;
  globalError?: string | null;
  onAccept: () => void;
  onReject: () => void;
}

export default function AcceptInvitation({
  trainerName,
  isLoading,
  globalError,
  onAccept,
  onReject,
}: AcceptInvitationProps) {
  const t = useTranslations("Auth");

  return (
    <div className="w-full max-w-md p-6 space-y-6 bg-card rounded-xl border border-border shadow-sm text-center">
      <h2 className="text-2xl font-bold tracking-tight">{t("invitationReceivedTitle")}</h2>
      <p className="text-sm text-muted-foreground">
        {t("invitationReceivedSubtitle", {
          trainerName: trainerName || t("defaultTrainer"),
        })}
      </p>

      {globalError && (
        <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive">
          {globalError}
        </div>
      )}

      <div className="flex flex-col gap-3 pt-4">
        <button
          type="button"
          onClick={onAccept}
          disabled={isLoading}
          className="w-full h-10 px-4 font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? t("processing") : t("acceptInviteButton")}
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={isLoading}
          className="w-full h-10 px-4 font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80 disabled:opacity-50 transition-colors"
        >
          {t("rejectInviteButton")}
        </button>
      </div>
    </div>
  );
}