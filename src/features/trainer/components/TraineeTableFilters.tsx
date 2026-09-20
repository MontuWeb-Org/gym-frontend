"use client";

import { useTranslations } from "next-intl";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TraineeStatus } from "../types/trainer.types";


export type FilterTab = "ALL" | "ACTIVE" | "FALLING_BEHIND" | "PENDING_INVITE";

export const FILTER_TAB_STATUS_MAP: Record<Exclude<FilterTab, "ALL">, TraineeStatus[]> = {
  ACTIVE: ["ON_TRACK", "AT_RISK"],
  FALLING_BEHIND: ["FALLING_BEHIND", "NEEDS_PLAN"],
  PENDING_INVITE: ["NOT_STARTED"],
};

interface TraineeTableFiltersProps {
  totalCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  onInvite?: () => void;
}

export function TraineeTableFilters({
  totalCount,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  onInvite,
}: TraineeTableFiltersProps) {
  const t = useTranslations("TraineesTable");

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "ALL", label: t("tabs.all") },
    { id: "ACTIVE", label: t("tabs.active") },
    { id: "FALLING_BEHIND", label: t("tabs.fallingBehind") },
    { id: "PENDING_INVITE", label: t("tabs.pendingInvite") },
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("title")}{" "}
          <span className="font-normal text-muted-foreground">
            ({totalCount})
          </span>
        </h1>
        <Button
          onClick={onInvite}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> {t("inviteTrainee")}
        </Button>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-card pl-9 text-card-foreground border-border focus-visible:ring-ring rtl:pl-3 rtl:pr-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onTabChange(tab.id)}
                className={`rounded-full px-4 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-border bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                }`}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}