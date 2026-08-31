import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-12 gap-4">
      <h1 className="font-bold text-2xl text-foreground">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
    </div>
  );
}