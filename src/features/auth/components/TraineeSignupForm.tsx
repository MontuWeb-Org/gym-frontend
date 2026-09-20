"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import AuthForm, { AuthFieldConfig } from "./AuthForm";

export interface TraineeSignupFormValues {
  name: string;
  password: string;
  confirmPassword: string;
}

interface TraineeSignupFormProps {
  trainerName?: string;
  values: TraineeSignupFormValues;
  isLoading: boolean;
  globalError?: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: () => void;
}

export default function TraineeSignupForm({
  trainerName,
  values,
  isLoading,
  globalError,
  onChange,
  onSubmit,
}: TraineeSignupFormProps) {
  const t = useTranslations("Auth");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const STRONG_PASSWORD_REGEX =
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$";

  const fields: AuthFieldConfig[] = [
    {
      name: "name",
      label: t("fullNameLabel"),
      placeholder: t("fullNamePlaceholder"),
      autoComplete: "name",
    },
    {
      name: "password",
      label: t("passwordLabel"),
      type: "password",
      placeholder: "••••••••",
      pattern: STRONG_PASSWORD_REGEX,
      patternError: t("strongPasswordError"),
      autoComplete: "new-password",
    },
    {
      name: "confirmPassword",
      label: t("confirmPasswordLabel"),
      type: "password",
      placeholder: "••••••••",
      autoComplete: "new-password",
    },
  ];

  const fieldErrors: Record<string, string> = {};
  const visibleErrors: Record<string, string> = {};

  fields.forEach((field) => {
    const val = values[field.name as keyof TraineeSignupFormValues] || "";

    if (!val.trim()) {
      fieldErrors[field.name] = t("fieldRequired", { field: field.label });
    } else if (field.pattern && !new RegExp(field.pattern).test(val)) {
      fieldErrors[field.name] = field.patternError || t("invalidFormat");
    }

    if (touched[field.name] && fieldErrors[field.name]) {
      visibleErrors[field.name] = fieldErrors[field.name];
    }
  });

  if (values.confirmPassword && values.password !== values.confirmPassword) {
    fieldErrors.confirmPassword = t("passwordMismatch");
    if (touched.confirmPassword) {
      visibleErrors.confirmPassword = t("passwordMismatch");
    }
  }

  const isFormValid =
    Object.keys(fieldErrors).length === 0 &&
    fields.every((f) =>
      Boolean(values[f.name as keyof TraineeSignupFormValues]?.trim())
    );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
    onChange(e);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;
    onSubmit();
  };

  return (
    <AuthForm
      title={t("traineeSetupTitle")}
      subtitle={t("traineeSetupSubtitle", {
        trainerName: trainerName || t("defaultTrainer"),
      })}
      submitLabel={t("completeSetupButton")}
      isLoading={isLoading}
      isSubmitDisabled={!isFormValid}
      error={globalError}
      fieldErrors={visibleErrors}
      fields={fields}
      values={values as unknown as Record<string, string>}
      onChange={handleChange}
      onSubmit={handleSubmit}
      footer={
        <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground underline">
          {t("alreadyHaveAccount")}
        </Link>
      }
    />
  );
}