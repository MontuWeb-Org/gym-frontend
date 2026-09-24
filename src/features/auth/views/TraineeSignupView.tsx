"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import TraineeSignupForm, { TraineeSignupFormValues } from "../components/TraineeSignupForm";
import { inviteSetupThunk } from "../store/auth.slice";
import { hashPassword } from "@/lib/crypto";

export default function TraineeSignupView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error: globalError, creationToken, inviteDetails } = useAppSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState<TraineeSignupFormValues>({
    name: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!creationToken) return;

    const hashedPassword = await hashPassword(formData.password);
    const result = await dispatch(
      inviteSetupThunk({
        creationToken,
        name: formData.name,
        password: hashedPassword,
      })
    );

    if (inviteSetupThunk.fulfilled.match(result)) {
      router.push("/trainee");
    }
  };

  return (
    <TraineeSignupForm
      trainerName={inviteDetails?.result?.trainerName || ""}
      values={formData}
      isLoading={isLoading}
      globalError={globalError}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}