"use client";

import React, { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import AuthCardWrapper from "./AuthCardWrapper";
import { cn } from "@/lib/utils";

export interface Option {
  label: string;
  value: string;
}

export interface AuthFieldConfig {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "tel" | "select";
  placeholder?: string;
  required?: boolean;
  options?: Option[];
  autoComplete?: string;
  pattern?: string;
  patternError?: string;
}

interface AuthFormProps {
  title: string;
  subtitle?: string;
  fields: AuthFieldConfig[];
  values: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  isLoading?: boolean;
  isSubmitDisabled?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string>;
  footer?: React.ReactNode;
  className?: string;
}

export default function AuthForm({
  title,
  subtitle,
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel,
  isLoading = false,
  isSubmitDisabled = false,
  error,
  fieldErrors = {},
  footer,
  className,
}: AuthFormProps) {
  const baseId = useId();
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  return (
    <AuthCardWrapper title={title} subtitle={subtitle} footer={footer} className={className}>
      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md text-center">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 text-start" noValidate>
        {fields.map((field) => {
          const fieldId = `${baseId}-${field.name}`;
          const isSelect = field.type === "select";
          const isPassword = field.type === "password";
          const isPasswordVisible = Boolean(showPasswordMap[field.name]);
          const fieldError = fieldErrors[field.name];
          const hasError = Boolean(fieldError);

          const inputType = isPassword
            ? isPasswordVisible
              ? "text"
              : "password"
            : field.type || "text";

          return (
            <div key={field.name} className="space-y-1.5">
              <label
                htmlFor={fieldId}
                className={cn(
                  "block text-xs font-semibold uppercase tracking-wider transition-colors",
                  hasError ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {field.label}
              </label>

              {isSelect ? (
                <select
                  id={fieldId}
                  name={field.name}
                  value={values[field.name] || ""}
                  onChange={onChange}
                  disabled={isLoading}
                  required={field.required ?? true}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${fieldId}-error` : undefined}
                  className={cn(
                    "w-full px-3 py-2 text-sm border rounded-md bg-background text-foreground transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                    hasError
                      ? "border-destructive focus:ring-destructive/50 text-destructive"
                      : "border-input focus:ring-ring"
                  )}
                >
                  <option value="" disabled>
                    {field.placeholder || "Select an option"}
                  </option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="relative flex items-center">
                  <input
                    id={fieldId}
                    type={inputType}
                    name={field.name}
                    value={values[field.name] || ""}
                    onChange={onChange}
                    placeholder={field.placeholder}
                    disabled={isLoading}
                    required={field.required ?? true}
                    autoComplete={field.autoComplete}
                    pattern={field.pattern}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${fieldId}-error` : undefined}
                    className={cn(
                      "w-full px-3 py-2 text-sm border rounded-md bg-background text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed [&::-ms-reveal]:hidden [&::-ms-clear]:hidden",
                      isPassword && "pr-10",
                      hasError
                        ? "border-destructive focus:ring-destructive/50"
                        : "border-input focus:ring-ring"
                    )}
                  />
                  {isPassword && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePasswordVisibility(field.name);
                      }}
                      disabled={isLoading}
                      tabIndex={-1}
                      className="absolute right-3 z-10 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer p-1"
                      aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  )}
                </div>
              )}

              {hasError && (
                <p id={`${fieldId}-error`} className="text-xs font-medium text-destructive mt-1">
                  {fieldError}
                </p>
              )}
            </div>
          );
        })}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || isSubmitDisabled}
            className={cn(
              "w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium text-sm rounded-md shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            )}
          >
            {isLoading && (
              <span className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            )}
            {submitLabel}
          </button>
        </div>
      </form>
    </AuthCardWrapper>
  );
}