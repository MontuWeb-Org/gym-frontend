"use client";

import { useTranslations } from "next-intl";
import AuthCardWrapper from "./AuthCardWrapper";

interface InvitationReviewFormProps {
  trainerName?: string;
  isLoading: boolean;
  loadingLabel?: string;
  globalError?: string | null;
  onAccept: () => void;
  onReject: () => void;
}

export default function InvitationReviewForm({
  trainerName,
  isLoading,
  loadingLabel,
  globalError,
  onAccept,
  onReject,
}: Readonly<InvitationReviewFormProps>) {
  const t = useTranslations("Auth");

  return (
    <AuthCardWrapper
      title={t("invitationReceivedTitle")}
      subtitle={t("invitationReceivedSubtitle", {
        trainerName: trainerName || t("defaultTrainer"),
      })}
    >
      {globalError && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md text-center">
          {globalError}
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={onAccept}
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium text-sm rounded-md shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading && (
            <span className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          )}
          {isLoading ? loadingLabel ?? t("processing") : t("acceptInviteButton")}
        </button>

        <button
          type="button"
          onClick={onReject}
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-secondary text-foreground font-medium text-sm rounded-md shadow-sm transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {t("rejectInviteButton")}
        </button>
      </div>
    </AuthCardWrapper>
  );
}