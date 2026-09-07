"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { type UserRole } from "@/data/routes";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  const t = useTranslations("Login");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("alex@example.com");
  const [name, setName] = useState("Alex Johnson");
  const [role, setRole] = useState<UserRole>("admin");

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

    router.push(`/${role}`);
  };

  return (
    <main>
      <AuthForm
        title={t("title")}
        subtitle={t("description")}
        submitLabel={t("submitButton")}
        onSubmit={handleSubmit}
        fields={[
          {
            name: "name",
            label: t("nameLabel"),
            type: "text",
            value: name,
            onChange: (e) => setName(e.target.value),
          },
          {
            name: "email",
            label: t("emailLabel"),
            type: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
          },
          {
            name: "role",
            label: t("roleLabel"),
            type: "select",
            value: role,
            onChange: (e) => setRole(e.target.value as UserRole),
            options: [
              { label: t("roles.admin"), value: "admin" },
              { label: t("roles.coach"), value: "coach" },
              { label: t("roles.trainee"), value: "trainee" },
            ],
          },
        ]}
        footer={
          <div className="flex flex-col gap-2 text-center">
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              &larr; {t("backToHome")}
            </Link>
          </div>
        }
      />
    </main>
  );
}