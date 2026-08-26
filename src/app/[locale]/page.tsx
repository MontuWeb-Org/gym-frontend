import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function WelcomePage() {
  const t = useTranslations("Home");
  const loginT = useTranslations("Login");

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 text-center">
      
      {/* Language Switcher in the top corner */}
      <div className="absolute top-6 end-6">
        <LocaleSwitcher />
      </div>

      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>

        <div className="pt-4">
          <Link
            href="/login"
            className="inline-block w-full rounded-md bg-primary py-2.5 px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            {loginT("submitButton")}
          </Link>
        </div>
      </div>
    </main>
  );
}