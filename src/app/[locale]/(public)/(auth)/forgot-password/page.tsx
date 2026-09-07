"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import AuthForm from "@/components/auth/AuthForm";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main>
        <AuthForm
          title="Check your email"
          subtitle={`We've sent a password reset link to ${email}`}
          submitLabel="Back to Login"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/login");
          }}
          fields={[]}
          footer={
            <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground underline">
              Return to login
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main>
      <AuthForm
        title="Reset your password"
        subtitle="Enter the email on your account and we'll send a reset link."
        submitLabel="Send Reset Link"
        onSubmit={handleSubmit}
        fields={[
          {
            name: "email",
            label: "Email",
            type: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: "alex@example.com",
          },
        ]}
        footer={
          <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground underline">
            &larr; Back to login
          </Link>
        }
      />
    </main>
  );
}