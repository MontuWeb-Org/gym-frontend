"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import DynamicDashboard from "@/features/trainer/components/DynamicDashboard";
import { useTranslations } from "next-intl";
export default function TrainerDashboardView() {
  const t = useTranslations("Trainer.dashboard");
  
  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />
      <DynamicDashboard />
    </div>
  );
}