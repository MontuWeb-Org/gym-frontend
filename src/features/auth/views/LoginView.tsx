"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppDispatch } from "@/store/hooks";
import { loginThunk } from "@/features/auth/store/auth.slice";
import AuthForm from "@/features/auth/components/AuthForm";

export default function LoginView() {
const t = useTranslations("Login");
const dispatch = useAppDispatch();
const router = useRouter();

const [identifier, setIdentifier] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setError(null);
setIsLoading(true);


try {
  // Send the original password to the backend.
  // The backend is responsible for password hashing/comparison.
  const result = await dispatch(
    loginThunk({
      identifier,
      password,
    })
  );

  if (loginThunk.fulfilled.match(result)) {
    const user = result.payload;
    const roleRoute = String(user.role).toLowerCase();

    router.push(`/${roleRoute}`);
  } else {
    setError(
      (result.payload as string) ||
        "Invalid credentials. Please try again."
    );
  }
} catch (err: unknown) {
  setError(
    err instanceof Error
      ? err.message
      : "An unexpected error occurred."
  );
} finally {
  setIsLoading(false);
}


};

return ( <main>
<AuthForm
title={t("title")}
subtitle={t("description")}
submitLabel={t("submitButton")}
onSubmit={handleSubmit}
isLoading={isLoading}
error={error}
values={{ identifier, password }}
onChange={(
e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
const { name, value } = e.target;


      if (name === "identifier") {
        setIdentifier(value);
      }

      if (name === "password") {
        setPassword(value);
      }
    }}
    fields={[
      {
        name: "identifier",
        label: t("emailLabel"),
        type: "text",
        placeholder: "alex@example.com",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: true,
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
