"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export function NewTemplateModal({ isOpen, onClose, onCreate }: NewTemplateModalProps) {
  const t = useTranslations("Trainer.templates");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the browser from refreshing the page
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim());
    setName("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-semibold">{t("modalTitle")}</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("nameLabel")}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="mt-1"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("descLabel")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descPlaceholder")}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
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