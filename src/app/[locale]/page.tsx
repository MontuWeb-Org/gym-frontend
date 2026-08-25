import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Home");
  return (
    <div className="flex flex-col bg-background items-center justify-center min-h-screen py-2 gap-4">
      <h1 className="font-bold text-xl text-foreground">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
    </div>
  );
}
