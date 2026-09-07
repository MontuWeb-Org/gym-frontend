"use client";

import React from "react";
import AuthCardWrapper from "./AuthCardWrapper";

export interface AuthField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "select";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
  placeholder?: string;
}

interface AuthFormProps {
  title: string;
  subtitle?: string;
  fields: AuthField[];
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  footer?: React.ReactNode;
}

export default function AuthForm({
  title,
  subtitle,
  fields,
  onSubmit,
  submitLabel,
  footer,
}: AuthFormProps) {
  return (
    <AuthCardWrapper title={title} subtitle={subtitle} footer={footer}>
      <form onSubmit={onSubmit} className="space-y-4 text-start">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              {field.label}
            </label>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                required={field.required ?? true}
              />
            )}
          </div>
        ))}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary text-primary-foreground font-medium text-sm rounded-md hover:bg-primary/90 transition-colors"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </AuthCardWrapper>
  );
}