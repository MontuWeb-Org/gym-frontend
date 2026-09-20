"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import AuthForm, { AuthFieldConfig } from "./AuthForm";

interface SetupFormData {
  name: string;
  password: string;
}

interface InvitationSetupFormProps {
  trainerName?: string;
  isLoading: boolean;
  loadingLabel?: string;
  globalError?: string | null;
  fieldErrors?: Record<string, string>;
  onSubmit: (data: SetupFormData) => void;
  onBack: () => void;
}

export default function InvitationSetupForm({
  isLoading,
  loadingLabel,
  globalError,
  fieldErrors = {},
  onSubmit,
  onBack,
}: Readonly<InvitationSetupFormProps>) {
  const t = useTranslations("Auth");

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });

  const [localError, setLocalError] = useState<string | null>(null);
  const [localFieldErrors, setLocalFieldErrors] = useState<Record<string, string>>({});

  const fields: AuthFieldConfig[] = [
    {
      name: "name",
      label: t("fullNameLabel"),
      type: "text",
      placeholder: t("fullNamePlaceholder"),
      required: true,
      autoComplete: "name",
    },
    {
      name: "password",
      label: t("passwordLabel"),
      type: "password",
      placeholder: "••••••••",
      required: true,
      autoComplete: "new-password",
    },
    {
      name: "confirmPassword",
      label: t("confirmPasswordLabel"),
      type: "password",
      placeholder: "••••••••",
      required: true,
      autoComplete: "new-password",
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (localError) setLocalError(null);
    if (localFieldErrors[name] || fieldErrors[name]) {
      setLocalFieldErrors((prev) => {
        const rest = { ...prev };
        delete rest[name];
        return rest;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    setLocalFieldErrors({});

    if (!formData.name.trim() || !formData.password) {
      setLocalError(t("nameAndPasswordRequired"));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalFieldErrors({
        confirmPassword: t("passwordMismatch"),
      });
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      password: formData.password,
    });
  };

  return (
    <AuthForm
      title={t("setupAccountTitle")}
      subtitle={t("setupAccountSubtitle")}
      fields={fields}
      values={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel={
        isLoading ? loadingLabel ?? t("processing") : t("finishSetupButton")
      }
      isLoading={isLoading}
      error={localError || globalError}
      fieldErrors={{ ...fieldErrors, ...localFieldErrors }}
      footer={
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="w-full h-10 px-4 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80 disabled:opacity-50 transition-colors flex items-center justify-center cursor-pointer"
        >
          {t("backButton")}
        </button>
      }
    />
  );
}