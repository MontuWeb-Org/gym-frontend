"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import AuthForm from "@/features/auth/components/AuthForm";

export default function ForgotPasswordView() {
  const t = useTranslations("Login"); // or your preferred namespace
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Simulate API call with a "blind" success state to prevent email enumeration
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSubmitted(true);
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm">
          <h2 className="text-xl font-bold mb-2">Check your email</h2>
          <p className="text-sm text-muted-foreground mb-6">
            If an account exists for {identifier}, we have sent password reset instructions.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center text-sm font-medium text-primary hover:underline"
          >
            &larr; Back to Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <AuthForm
        title="Forgot Password"
        subtitle="Enter your email to receive reset instructions."
        submitLabel="Send Reset Instructions"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        values={{ identifier }}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
          setIdentifier(e.target.value);
        }}
        fields={[
          {
            name: "identifier",
            label: "Email Address",
            type: "text",
            placeholder: "alex@example.com",
            required: true,
          },
        ]}
        footer={
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              &larr; Back to Sign In
            </Link>
          </div>
        }
      />
    </main>
  );
}