"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import AuthForm from "@/components/auth/AuthForm";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(
      setUser({
        id: "1",
        name: formData.fullName || "Coach User",
        email: formData.email || "coach@example.com",
        role: "coach",
      })
    );

    router.push("/coach");
  };

  return (
    <main>
      <AuthForm
        title="Coach Sign Up"
        subtitle="Enter your details to manage your coach dashboard."
        submitLabel="Complete Sign Up"
        onSubmit={handleSignup}
        fields={[
          {
            name: "fullName",
            label: "Full Name",
            type: "text",
            value: formData.fullName,
            onChange: handleChange,
            placeholder: "Karim Coach",
          },
          {
            name: "businessName",
            label: "Business / Gym Name",
            type: "text",
            value: formData.businessName,
            onChange: handleChange,
            placeholder: "Apex Fitness Studio",
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            value: formData.email,
            onChange: handleChange,
            placeholder: "karim@apexfit.com",
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            value: formData.password,
            onChange: handleChange,
            placeholder: "••••••••",
          },
          {
            name: "confirmPassword",
            label: "Confirm Password",
            type: "password",
            value: formData.confirmPassword,
            onChange: handleChange,
            placeholder: "••••••••",
          },
        ]}
        footer={
          <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground underline">
            Already have an account? Login
          </Link>
        }
      />
    </main>
  );
}