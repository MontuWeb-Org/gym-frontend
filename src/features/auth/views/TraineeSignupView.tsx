"use client";

import { useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import TrainerSignupForm, {
  TrainerSignupFormValues,
} from "../components/TrainerSignupForm";
import {
  registerInitThunk,
  registerCompleteThunk,
} from "../store/auth.slice";
import { hashPassword } from "@/lib/crypto";

export default function TrainerSignupView() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    isLoading,
    error: globalError,
    creationToken,
  } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState<TrainerSignupFormValues>({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  /**
   * Prevents duplicate requests caused by double clicks,
   * form submit + button click, or other duplicate events.
   *
   * A ref is used instead of Redux `isLoading` because the ref
   * is updated synchronously before the async request starts.
   */
  const submittingRef = useRef(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleInit = async () => {
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;

    try {
      const hashedPassword = await hashPassword(formData.password);

      const result = await dispatch(
        registerInitThunk({
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          password: hashedPassword,
        }),
      );

      if (registerInitThunk.fulfilled.match(result)) {
        setStep(2);
      }
    } finally {
      submittingRef.current = false;
    }
  };

  const handleComplete = async () => {
    if (submittingRef.current) {
      return;
    }

    if (!creationToken) {
      return;
    }

    submittingRef.current = true;

    try {
      const result = await dispatch(
        registerCompleteThunk({
          otp: formData.otp,
          creationToken,
        }),
      );

      if (registerCompleteThunk.fulfilled.match(result)) {
        const user = result.payload;
        const roleRoute = String(user.role).toLowerCase();

        router.push(`/${roleRoute}`);
      }
    } finally {
      submittingRef.current = false;
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