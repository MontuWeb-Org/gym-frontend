"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import InvitationSetupForm from "@/features/auth/components/InvitationSetupForm";
import InvitationReviewForm from "@/features/auth/components/InvitationReviewForm";
import {
  inviteVerifyThunk,
  inviteAcceptThunk,
  inviteSetupThunk,
} from "../store/auth.slice";
import { Loader2 } from "lucide-react";
import { hashPassword } from "@/lib/crypto";
import { toast } from "sonner";

type WizardStep = "review" | "setup";
type ActionStep = "idle" | "setting-up" | "accepting" | "rejecting";

export default function InvitationView() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const token = searchParams.get("token");

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [actionStep, setActionStep] = useState<ActionStep>("idle");
  const [wizardStep, setWizardStep] = useState<WizardStep>("review");

  const {
    isLoading,
    error: globalError,
    inviteDetails,
  } = useAppSelector((state) => state.auth);

  const creationToken = inviteDetails?.result?.creationToken;
  const status = inviteDetails?.result?.status;
  const trainerName = inviteDetails?.result?.trainerName;

  useEffect(() => {
    if (token) {
      dispatch(inviteVerifyThunk(token));
    }
  }, [dispatch, token]);

  const clearErrors = () => {
    setFormError(null);
    setFieldErrors({});
  };

  const applyRejectionErrors = (payload: unknown) => {
    if (
      payload &&
      typeof payload === "object" &&
      "details" in payload &&
      Array.isArray((payload as Record<string, unknown>).details)
    ) {
      const typedPayload = payload as Record<string, unknown>;
      const next: Record<string, string> = {};
      for (const d of typedPayload.details as unknown[]) {
        const detail = d as Record<string, unknown>;
        if (detail?.field && detail?.message) next[detail.field as string] = detail.message as string;
      }
      setFieldErrors(next);
      setFormError((typedPayload.message as string) ?? null);
    } else {
      setFormError(typeof payload === "string" ? payload : t("somethingWentWrong"));
    }
  };

  const handleAcceptInvite = async () => {
    if (!creationToken) return;

    if (status === "SETUP_PASSWORD") {
      clearErrors();
      setWizardStep("setup");
      return;
    }

    clearErrors();
    setActionStep("accepting");
    const acceptResult = await dispatch(
      inviteAcceptThunk({ creationToken, accept: true })
    );
    setActionStep("idle");

    if (inviteAcceptThunk.fulfilled.match(acceptResult)) {
      router.push("/trainee");
    } else {
      applyRejectionErrors(acceptResult.payload);
    }
  };

  const handleCompleteSetup = async ({ name, password }: { name: string; password: string }) => {
    if (!creationToken) return;
    clearErrors();

    try {
      setActionStep("setting-up");

      const hashedPassword = await hashPassword(password);

      const setupResult = await dispatch(
        inviteSetupThunk({
          creationToken,
          name,
          password: hashedPassword,
        })
      );

      if (inviteSetupThunk.fulfilled.match(setupResult)) {
        router.push("/trainee");
      } else {
        applyRejectionErrors(setupResult.payload);
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t("unexpectedError"));
    } finally {
      setActionStep("idle");
    }
  };

  const handleRejectInvite = () => {
    if (!creationToken) return;

    toast(t("confirmDeclineInvitation"), {
      action: {
        label: t("confirm"),
        onClick: async () => {
          clearErrors();
          setActionStep("rejecting");
          const result = await dispatch(
            inviteAcceptThunk({ creationToken, accept: false })
          );
          setActionStep("idle");

          if (inviteAcceptThunk.fulfilled.match(result)) {
            router.push("/");
          } else {
            applyRejectionErrors(result.payload);
          }
        },
      },
      cancel: {
        label: t("cancel"),
        onClick: () => {},
      },
    });
  };

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm text-center space-y-2">
          <h2 className="text-lg font-bold text-destructive">{t("invalidInvitationTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("invalidInvitationSubtitle")}</p>
        </div>
      </div>
    );
  }

  if (isLoading && !creationToken) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-background">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("verifyingInvitation")}</p>
        </div>
      </div>
    );
  }

  if (!isLoading && !creationToken && globalError) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm text-center space-y-2">
          <h2 className="text-lg font-bold text-destructive">{t("invitationNotFoundTitle")}</h2>
          <p className="text-sm text-muted-foreground">{globalError}</p>
        </div>
      </div>
    );
  }

  let actionLabel: string | undefined;
  if (actionStep === "setting-up") {
    actionLabel = t("creatingAccount");
  } else if (actionStep === "accepting") {
    actionLabel = t("acceptingInvite");
  } else if (actionStep === "rejecting") {
    actionLabel = t("decliningInvite");
  }

  return (
    <main>
      {wizardStep === "review" && (
        <InvitationReviewForm
          trainerName={trainerName}
          isLoading={actionStep !== "idle"}
          loadingLabel={actionLabel}
          globalError={formError}
          onAccept={handleAcceptInvite}
          onReject={handleRejectInvite}
        />
      )}

      {wizardStep === "setup" && (
        <InvitationSetupForm
          trainerName={trainerName}
          isLoading={actionStep === "setting-up"}
          loadingLabel={actionLabel}
          globalError={formError}
          fieldErrors={fieldErrors}
          onSubmit={handleCompleteSetup}
          onBack={() => {
            clearErrors();
            setWizardStep("review");
          }}
        />
      )}
    </main>
  );
}