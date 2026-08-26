import { useTranslations } from "next-intl";

export default function ClassesPage() {
  const t = useTranslations("Classes");

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
    </div>
  );
}