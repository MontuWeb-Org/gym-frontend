"use client";

import { useState, useId } from "react";
import { useTranslations } from "next-intl";
import { Mail, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
}

export function InvitationModal({
  isOpen,
  onClose,
  onSubmit,
}: InvitationModalProps) {
  const t = useTranslations("InvitationModal");
  const fieldId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const hasError = Boolean(error);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      setError(t("invalidEmail"));
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(email.trim());
      setEmail("");
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : t("genericError");
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setEmail("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg">
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-xs p-1 text-muted-foreground hover:bg-muted hover:text-foreground rtl:left-4 rtl:right-auto"
        >
          <X className="size-4" />
        </button>

        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor={fieldId}
              className={cn(
                "block text-xs font-semibold uppercase tracking-wider transition-colors",
                hasError ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {t("emailLabel")}
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
              <Input
                id={fieldId}
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${fieldId}-error` : undefined}
                className={cn(
                  "bg-background pl-9 text-foreground border transition-colors rtl:pl-3 rtl:pr-9",
                  hasError
                    ? "border-destructive focus-visible:ring-destructive/50"
                    : "border-input focus-visible:ring-ring"
                )}
              />
            </div>
            {hasError && (
              <p
                id={`${fieldId}-error`}
                className="mt-1 text-xs font-medium text-destructive"
              >
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-border bg-card text-foreground hover:bg-muted"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px] bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                t("sendInvite")
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}