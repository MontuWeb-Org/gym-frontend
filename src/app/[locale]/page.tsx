import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6 text-center min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("description")}
      </p>

      {/* Navigation CTA Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/login"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Sign In
        </Link>
      </div>
    </main>
  );
}