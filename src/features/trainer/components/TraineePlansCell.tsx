"use client";

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
}

export function TraineePlansCell({ plans = [] }: TraineePlansCellProps) {
  if (!plans || plans.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const primaryPlan = plans[0];
  const extraCount = plans.length - 1;

  return (
    <div className="flex items-center gap-2">
      <span className="max-w-[180px] truncate text-sm font-medium text-foreground">
        {primaryPlan.template?.templateName || "Unnamed Plan"}
      </span>

      {extraCount > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1 px-1.5 py-0.5 text-[10px] font-semibold transition-colors hover:bg-secondary/80"
            >
              <Layers className="size-3 text-muted-foreground" />
              +{extraCount}
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 shadow-md" align="start">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              Assigned Programs ({plans.length})
            </p>
            <div className="space-y-1.5">
              {plans.map((plan, idx) => (
                <div
                  key={plan.template?.templateId ?? idx}
                  className="flex items-center justify-between rounded-md border border-border/50 bg-muted/40 p-2 text-xs"
                >
                  <span className="max-w-[130px] truncate font-medium text-foreground">
                    {plan.template?.templateName}
                  </span>
                  <span className="font-semibold text-primary">
                    {plan.adherencePercentage}%
                  </span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}