"use client";

import { useState, useId } from "react";
import { useTranslations } from "next-intl";
import { Mail, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      setEmail("");
      setError(null);
      onClose();
    }
  };
    
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle className="font-heading text-xl uppercase tracking-wider text-foreground">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2" noValidate>
          <div className="space-y-1.5 text-start">
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
              <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
                  "ps-9 pe-3 text-foreground transition-colors",
                  hasError ? "border-destructive focus-visible:ring-destructive/50" : ""
                )}
              />
            </div>
            {hasError && (
              <p id={`${fieldId}-error`} className="text-xs font-medium text-destructive">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto font-heading uppercase tracking-wider"
            >
              {isSubmitting ? (
                <Loader2 className="me-2 size-4 animate-spin" />
              ) : (
                <Send className="me-2 size-4" />
              )}
              {t("sendInvite")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}