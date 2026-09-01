"use client";

import { useTranslations } from "next-intl";

export default function CoachBillingPage() {
  const t = useTranslations("CoachBilling");

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
    </div>
  );
}
