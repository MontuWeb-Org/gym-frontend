"use client";

import { useTranslations } from "next-intl";

export default function AdminPage() {
  const t = useTranslations("Admin");

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
    </div>
  );
}