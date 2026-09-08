"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import TrainerSignupForm, { TrainerSignupFormValues } from "../components/TrainerSignupForm";
import { registerInitThunk, registerCompleteThunk, setUser } from "../store/auth.slice";
import { UserRole } from "../types/auth.types";
import { hashPassword } from "@/lib/crypto";

export default function TrainerSignupView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error: globalError, creationToken } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<TrainerSignupFormValues>({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleInit = async () => {
    const hashedPassword = await hashPassword(formData.password);

    const result = await dispatch(
      registerInitThunk({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: hashedPassword,
      })
    );

    if (registerInitThunk.fulfilled.match(result)) {
      setStep(2);
    }
  };

  const handleComplete = async () => {
    if (!creationToken) return;

    const result = await dispatch(
      registerCompleteThunk({
        otp: formData.otp,
        creationToken,
      })
    );

    if (registerCompleteThunk.fulfilled.match(result)) {
      dispatch(
        setUser({
          id: "1",
          name: formData.name,
          email: formData.email,
          role: UserRole.TRAINER,
        })
      );
      router.push("/trainer");
    }
  };

  return (
    <TrainerSignupForm
      step={step}
      values={formData}
      isLoading={isLoading}
      globalError={globalError}
      onChange={handleChange}
      onSubmitInit={handleInit}
      onSubmitComplete={handleComplete}
      onBackToStep1={() => setStep(1)}
    />
  );
}