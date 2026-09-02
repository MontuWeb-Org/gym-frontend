"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAppSelector } from "@/store/hooks";

export default function WelcomePage() {
  const t = useTranslations("Home");
  const loginT = useTranslations("Login");
  const user = useAppSelector((state) => state.auth.user);

  const getDashboardHref = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "coach") return "/coach";
    return "/trainee";
  };

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>

        <div className="pt-4">
          {user ? (
            <Link
              href={getDashboardHref()}
              className="inline-block w-full rounded-md bg-primary py-2.5 px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Go to Dashboard ({user.name})
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-block w-full rounded-md bg-primary py-2.5 px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              {loginT("submitButton")}
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}