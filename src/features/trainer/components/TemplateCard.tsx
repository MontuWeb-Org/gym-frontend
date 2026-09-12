"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanTemplate } from "../store/program.slice";

interface TemplateCardProps {
  template: PlanTemplate;
  onSelect: (id: number) => void;
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const t = useTranslations("Trainer.templates");

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{template.name}</h3>
          <Badge variant={template.status === "ACTIVE" ? "default" : "secondary"}>
            {template.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{template.description}</p>
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t text-xs text-muted-foreground">
        <span>{template.durationWeekTemplates || 0} {t("weeks")}</span>
        <Button size="sm" onClick={() => onSelect(template.id)}>
          {t("useOrEdit")}
        </Button>
      </div>
    </div>
  );
}