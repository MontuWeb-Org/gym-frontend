"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import AuthForm, { AuthFieldConfig } from "./AuthForm";

export interface ForgotPasswordFormValues {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface ForgotPasswordFormProps {
  step: 1 | 2;
  values: ForgotPasswordFormValues;
  isLoading: boolean;
  globalError?: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmitInit: () => void;
  onSubmitComplete: () => void;
  onBackToStep1: () => void;
}

export default function ForgotPasswordForm({
  step,
  values,
  isLoading,
  globalError,
  onChange,
  onSubmitInit,
  onSubmitComplete,
  onBackToStep1,
}: ForgotPasswordFormProps) {
  const t = useTranslations("Auth");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const STRONG_PASSWORD_REGEX =
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$";

  const getStep1Fields = (): AuthFieldConfig[] => [
    {
      name: "email",
      label: t("emailLabel"),
      type: "email",
      placeholder: "karim@apexfit.com",
      pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      patternError: t("emailPatternError"),
      autoComplete: "email",
    },
  ];

  const getStep2Fields = (): AuthFieldConfig[] => [
    {
      name: "otp",
      label: t("otpLabel"),
      type: "text",
      placeholder: "123456",
      pattern: "^\\d{6}$",
      patternError: t("otpPatternError"),
      autoComplete: "one-time-code",
    },
    {
      name: "newPassword",
      label: t("newPasswordLabel"),
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

  const activeFields = step === 1 ? getStep1Fields() : getStep2Fields();

  const fieldErrors: Record<string, string> = {};
  const visibleErrors: Record<string, string> = {};

  activeFields.forEach((field) => {
    const val = values[field.name as keyof ForgotPasswordFormValues] || "";

    if (!val.trim()) {
      fieldErrors[field.name] = t("fieldRequired", { field: field.label });
    } else if (field.pattern && !new RegExp(field.pattern).test(val)) {
      fieldErrors[field.name] = field.patternError || t("invalidFormat");
    }

    if (touched[field.name] && fieldErrors[field.name]) {
      visibleErrors[field.name] = fieldErrors[field.name];
    }
  });

  if (step === 2) {
    if (values.confirmPassword && values.newPassword !== values.confirmPassword) {
      fieldErrors.confirmPassword = t("passwordMismatch");
      if (touched.confirmPassword) {
        visibleErrors.confirmPassword = t("passwordMismatch");
      }
    }
  }

  const allFilled = activeFields.every((f) =>
    Boolean(values[f.name as keyof ForgotPasswordFormValues]?.trim())
  );

  const isStepValid = Object.keys(fieldErrors).length === 0 && allFilled;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
    onChange(e);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isStepValid) return;

    if (step === 1) {
      onSubmitInit();
    } else {
      onSubmitComplete();
    }
  };

  return step === 1 ? (
    <AuthForm
      title={t("forgotPasswordTitle")}
      subtitle={t("forgotPasswordSubtitle")}
      submitLabel={t("sendResetCodeButton")}
      isLoading={isLoading}
      isSubmitDisabled={!isStepValid}
      error={globalError}
      fieldErrors={visibleErrors}
      fields={getStep1Fields()}
      values={values as unknown as Record<string, string>}
      onChange={handleChange}
      onSubmit={handleSubmit}
      footer={
        <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground underline">
          {t("backToLogin")}
        </Link>
      }
    />
  ) : (
    <AuthForm
      title={t("resetPasswordTitle")}
      subtitle={t("resetPasswordSubtitle", { email: values.email })}
      submitLabel={t("resetPasswordButton")}
      isLoading={isLoading}
      isSubmitDisabled={!isStepValid}
      error={globalError}
      fieldErrors={visibleErrors}
      fields={getStep2Fields()}
      values={values as unknown as Record<string, string>}
      onChange={handleChange}
      onSubmit={handleSubmit}
      footer={
        <button
          type="button"
          onClick={onBackToStep1}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          {t("backToDetails")}
        </button>
      }
    />
  );
}