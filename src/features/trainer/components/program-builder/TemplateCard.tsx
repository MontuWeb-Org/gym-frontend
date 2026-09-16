"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Settings, UserPlus } from "lucide-react";

interface TemplateCardProps {
  id: number;
  name: string;
  description: string;
  durationWeeks?: number;
  status?: string;
  onConfigure: (id: number) => void;
  onAssign: (id: number) => void;
}

export function TemplateCard({
  id,
  name,
  description,
  durationWeeks = 4,
  status = "DRAFT",
  onConfigure,
  onAssign,
}: TemplateCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-base leading-snug">{name}</h4>
              <span className="text-xs text-muted-foreground">
                {durationWeeks} Weeks • <span className="uppercase font-medium">{status}</span>
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {description || "No description provided for this workout plan template."}
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onConfigure(id)}
          className="gap-1.5 text-xs"
        >
          <Settings className="h-3.5 w-3.5" />
          Configure
        </Button>
        <Button
          size="sm"
          onClick={() => onAssign(id)}
          className="gap-1.5 text-xs"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Assign
        </Button>
      </div>
    </div>
  );
}