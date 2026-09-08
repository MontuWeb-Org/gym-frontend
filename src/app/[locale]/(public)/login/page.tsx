"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/features/auth/store/auth.slice";
import AuthForm from "@/features/auth/components/AuthForm";
import { UserRole } from "@/features/auth";

export default function LoginPage() {
  const t = useTranslations("Login");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("alex@example.com");
  const [name, setName] = useState("Alex Johnson");
  const [role, setRole] = useState<UserRole>(UserRole.TRAINEE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      setUser({
        id: "usr_" + Date.now(),
        name: name || "User",
        email: email || "user@example.com",
        role: role || UserRole.TRAINEE,
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
        onChange={(e) => {
          if (e.target.name === "name") {
            setName(e.target.value);
          } else if (e.target.name === "email") {
            setEmail(e.target.value);
          } else if (e.target.name === "role") {
            setRole(e.target.value as UserRole);
          }
        }}
        values={{ name, email, role }}
        fields={[
          {
            name: "name",
            label: t("nameLabel"),
            type: "text",
          },
          {
            name: "email",
            label: t("emailLabel"),
            type: "email",
          },
          {
            name: "role",
            label: t("roleLabel"),
            type: "select",
            options: [
              { label: t("roles.admin"), value: "admin" },
              { label: t("roles.trainer"), value: "trainer" },
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