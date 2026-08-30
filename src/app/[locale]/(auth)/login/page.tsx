"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { type UserRole } from "@/data/routes";

export default function LoginPage() {
  const t = useTranslations("Login");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("alex@example.com");
  const [name, setName] = useState("Alex Johnson");
  const [role, setRole] = useState<UserRole>("trainee");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    dispatch(
      setUser({
        id: "usr_" + Date.now(),
        name: name || "User",
        email: email || "user@example.com",
        role,
      })
    );

    if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (role === "coach") {
      router.push("/coach/dashboard");
    } else {
      router.push("/trainee/dashboard");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm text-start">
        <h1 className="text-2xl font-bold text-foreground text-center">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground text-center mb-6">{t("description")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">{t("nameLabel")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">{t("emailLabel")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">{t("roleLabel")}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="admin">{t("roles.admin")}</option>
              <option value="coach">{t("roles.coach")}</option>
              <option value="trainee">{t("roles.trainee")}</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary text-primary-foreground font-medium text-sm rounded-md hover:bg-primary/90 transition-colors mt-2"
          >
            {t("submitButton")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
          >
            &larr; {t("backToHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}