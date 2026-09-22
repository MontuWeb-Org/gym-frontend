"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
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
}

export function TraineeTableFilters({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
}: TraineeTableFiltersProps) {
  const t = useTranslations("TraineesTable");

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "ALL", label: t("tabs.all") },
    { id: "ACTIVE", label: t("tabs.active") },
    { id: "FALLING_BEHIND", label: t("tabs.fallingBehind") },
    { id: "PENDING_INVITE", label: t("tabs.pendingInvite") },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="ps-9 text-md"
        />
      </div>

      {/* Responsive Scrollable Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onTabChange(tab.id)}
              className="rounded-full px-4 text-md font-heading uppercase tracking-wider whitespace-nowrap"
            >
              {tab.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}