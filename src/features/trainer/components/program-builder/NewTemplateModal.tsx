"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    name: string,
    description: string
  ) => void;
}

export function NewTemplateModal({
  isOpen,
  onClose,
  onCreate,
}: NewTemplateModalProps) {
  const t = useTranslations(
    "Trainer.templates"
  );

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [descriptionError, setDescriptionError] =
    useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const trimmedName =
      name.trim();

    const trimmedDescription =
      description.trim();

    if (!trimmedName) {
      return;
    }

    // Do not submit if description is empty.
    if (!trimmedDescription) {
      setDescriptionError(true);
      return;
    }

    setDescriptionError(false);

    onCreate(
      trimmedName,
      trimmedDescription
    );

    setName("");
    setDescription("");
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;

    setDescription(value);

    // Remove warning as soon as the user enters text.
    if (value.trim()) {
      setDescriptionError(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl space-y-4"
      >
        <h3 className="text-lg font-semibold">
          {t("modalTitle")}
        </h3>

        <div className="space-y-3">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {t("nameLabel")}
            </label>

            <Input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder={t(
                "namePlaceholder"
              )}
              className="mt-1"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {t("descLabel")}
            </label>

            <textarea
              value={description}
              onChange={
                handleDescriptionChange
              }
              placeholder={t(
                "descPlaceholder"
              )}
              className={`w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                descriptionError
                  ? "border-amber-400 focus-visible:ring-amber-400"
                  : "border-input"
              }`}
              rows={3}
              aria-invalid={
                descriptionError
              }
            />

            {descriptionError && (
              <p
                role="alert"
                className="mt-2 text-sm text-amber-700"
              >
                Please enter a description
                to create the template.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {t("cancel")}
          </Button>

          <Button type="submit">
            {t("createButton")}
          </Button>
        </div>
      </form>
    </div>
  );
}