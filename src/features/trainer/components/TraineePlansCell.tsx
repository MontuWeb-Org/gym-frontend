"use client";

import { useTranslations } from "next-intl";
import { Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TraineePlan } from "../types/trainer.types";

interface TraineePlansCellProps {
  plans?: TraineePlan[];
  align?: "start" | "center";
  /** "table" = compact single-line cell (default). "card" = full-width, room to show more of the name + its adherence. */
  variant?: "table" | "card";
}

export function TraineePlansCell({
  plans = [],
  align = "center",
  variant = "table",
}: TraineePlansCellProps) {
  const t = useTranslations("TraineesTable");
  const justifyClass = align === "center" ? "justify-center" : "justify-start";
  const isCard = variant === "card";

  if (!plans || plans.length === 0) {
    return (
      <div className={`flex items-center ${justifyClass}`}>
        <span className="text-lg text-muted-foreground">—</span>
      </div>
    );
  }

  const primaryPlan = plans[0];
  const primaryPlanName = primaryPlan.template?.templateName || t("unnamedPlan", { defaultValue: "Unnamed Plan" });
  const primaryAdherence = primaryPlan.adherencePercentage;
  const extraCount = plans.length - 1;

  if (isCard) {
    return (
      <div className="flex w-full items-start justify-between gap-2">
        <span
          className="flex-1 text-lg font-semibold text-foreground leading-snug break-words line-clamp-2"
          title={primaryPlanName}
        >
          {primaryPlanName}
        </span>

        <div className="flex shrink-0 items-center gap-1.5">
          {typeof primaryAdherence === "number" && (
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
              {primaryAdherence}%
            </span>
          )}

          {extraCount > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Badge
                  variant="secondary"
                  className="inline-flex cursor-pointer items-center gap-1 border border-border/80 bg-secondary/60 px-2 py-0.5 text-xs font-bold text-secondary-foreground transition-all hover:bg-secondary hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <Layers className="size-3 text-muted-foreground" />
                  <span>+{extraCount}</span>
                </Badge>
              </PopoverTrigger>

              <PopoverContent
                align="end"
                sideOffset={6}
                className="w-[min(20rem,90vw)] rounded-xl border border-border/80 bg-popover p-3.5 shadow-xl text-start space-y-3"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("assignedPrograms", { defaultValue: "Assigned Programs" })}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs font-bold">
                    {plans.length}
                  </Badge>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pe-1 scrollbar-thin">
                  {plans.map((plan, idx) => {
                    const name = plan.template?.templateName || t("unnamedPlan", { defaultValue: "Unnamed Plan" });
                    const adherence = plan.adherencePercentage;

                    return (
                      <div
                        key={plan.template?.templateId ?? idx}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs transition-colors hover:bg-muted/60"
                      >
                        <span className="truncate font-semibold text-foreground" title={name}>
                          {name}
                        </span>
                        {typeof adherence === "number" ? (
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md shrink-0">
                            {adherence}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground shrink-0">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    );
  }

  // table variant — unchanged, compact single-line cell
  return (
    <div className={`flex items-center gap-2 ${justifyClass}`}>
      <span
        className="max-w-[160px] sm:max-w-[200px] truncate text-lg font-semibold text-foreground"
        title={primaryPlanName}
      >
        {primaryPlanName}
      </span>

      {extraCount > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              variant="secondary"
              className="inline-flex cursor-pointer items-center gap-1 border border-border/80 bg-secondary/60 px-2 py-0.5 text-xs font-bold text-secondary-foreground transition-all hover:bg-secondary hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Layers className="size-3 text-muted-foreground" />
              <span>+{extraCount}</span>
            </Badge>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            sideOffset={6}
            className="w-72 rounded-xl border border-border/80 bg-popover p-3.5 shadow-xl text-start space-y-3"
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("assignedPrograms", { defaultValue: "Assigned Programs" })}
              </span>
              <Badge variant="outline" className="font-mono text-xs font-bold">
                {plans.length}
              </Badge>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pe-1 scrollbar-thin">
              {plans.map((plan, idx) => {
                const name = plan.template?.templateName || t("unnamedPlan", { defaultValue: "Unnamed Plan" });
                const adherence = plan.adherencePercentage;

                return (
                  <div
                    key={plan.template?.templateId ?? idx}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs transition-colors hover:bg-muted/60"
                  >
                    <span className="truncate font-semibold text-foreground max-w-[160px]" title={name}>
                      {name}
                    </span>
                    {typeof adherence === "number" ? (
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md shrink-0">
                        {adherence}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground shrink-0">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}