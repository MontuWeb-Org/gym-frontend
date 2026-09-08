"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import ForgotPasswordForm, { ForgotPasswordFormValues } from "../components/ForgotPasswordForm";
import {
  forgotPasswordInitThunk,
  forgotPasswordCompleteThunk,
} from "../store/auth.slice";
import { hashPassword } from "@/lib/crypto";

export default function ForgotPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const { isLoading, error: globalError, verificationToken: reduxToken } = useAppSelector(
    (state) => state.auth
  );

  const tokenFromUrl = searchParams.get("token") || "";
  const emailFromUrl = searchParams.get("email") || "";

  // Derive initial step directly during state initialization
  const [step, setStep] = useState<1 | 2>(tokenFromUrl ? 2 : 1);

  const [formData, setFormData] = useState<ForgotPasswordFormValues>({
    email: emailFromUrl,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleInit = async () => {
    const result = await dispatch(
      forgotPasswordInitThunk({ email: formData.email })
    );

    if (forgotPasswordInitThunk.fulfilled.match(result)) {
      setStep(2);
    }
  };

  const handleComplete = async () => {
    const activeToken = tokenFromUrl || reduxToken;
    if (!activeToken) return;

    const hashedPassword = await hashPassword(formData.newPassword);

    const result = await dispatch(
      forgotPasswordCompleteThunk({
        otp: formData.otp,
        verificationToken: activeToken,
        newPassword: hashedPassword,
      })
    );

    if (forgotPasswordCompleteThunk.fulfilled.match(result)) {
      const { user } = result.payload;
      const roleRoute = String(user.role).toLowerCase();
      router.push(`/${roleRoute}`);
    }
  };

  const handleBackToStep1 = () => {
    router.push("/forgot-password");
    setStep(1);
  };

  return (
    <ForgotPasswordForm
      step={step}
      values={formData}
      isLoading={isLoading}
      globalError={globalError}
      onChange={handleChange}
      onSubmitInit={handleInit}
      onSubmitComplete={handleComplete}
      onBackToStep1={handleBackToStep1}
    />
  );
}