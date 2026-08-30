import { useTranslations } from "next-intl";

export default function TraineeDashboard() {
  const t = useTranslations("Dashboard");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground">Trainee view and workout metrics.</p>
    </div>
  );
}