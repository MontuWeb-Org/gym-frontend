"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Gender, UserRole, BodyMetrics } from "@/features/user/types/user.types";
import { TextField } from "@/features/user/components/TextField";
import { SelectField } from "@/features/user/components/SelectField";
import { TextAreaField } from "@/features/user/components/TextAreaField";
import { NumberField } from "@/features/user/components/NumberField";

export interface ProfileFormData {
  name: string;
  phoneNumber: string;
  bio: string;
  experience: string;
  birthDate: string;
  gender: Gender;
  bodyMetrics: BodyMetrics;
}

interface ProfileFormProps {
  role: UserRole;
  initialData?: Partial<ProfileFormData>;
  onSubmit?: (data: ProfileFormData) => Promise<void> | void;
}

const formatForDateInput = (dateStr?: string) => {
  if (!dateStr) return "";
  return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
};

const buildInitialFormData = (initialData?: Partial<ProfileFormData>): ProfileFormData => ({
  name: initialData?.name || "",
  phoneNumber: initialData?.phoneNumber || "",
  bio: initialData?.bio || "",
  experience: initialData?.experience || "",
  birthDate: formatForDateInput(initialData?.birthDate),
  gender: initialData?.gender || Gender.MALE,
  bodyMetrics: {
    weightKg: initialData?.bodyMetrics?.weightKg,
    heightCm: initialData?.bodyMetrics?.heightCm,
    targetWeightKg: initialData?.bodyMetrics?.targetWeightKg,
  },
});

export function ProfileForm({ role, initialData, onSubmit }: ProfileFormProps) {
  const t = useTranslations("Profile");

  const [baseline] = useState<ProfileFormData>(() => buildInitialFormData(initialData));
  const [formData, setFormData] = useState<ProfileFormData>(baseline);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(baseline),
    [formData, baseline]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBodyMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bodyMetrics: {
        ...prev.bodyMetrics,
        [name]: value === "" ? undefined : Number(value),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        const submissionData: ProfileFormData = {
          ...formData,
          birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : "",
        };
        await onSubmit(submissionData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField id="name" name="name" label={t("nameLabel")} value={formData.name} onChange={handleChange} placeholder={t("namePlaceholder")} />
        <TextField id="phoneNumber" name="phoneNumber" label={t("phoneNumberLabel")} type="tel" value={formData.phoneNumber} onChange={handleChange} placeholder={t("phoneNumberPlaceholder")} />

        {role === UserRole.TRAINER && (
          <>
            <TextField id="experience" name="experience" label={t("experienceLabel")} value={formData.experience} onChange={handleChange} placeholder={t("experiencePlaceholder")} className="md:col-span-2" />
            <TextAreaField id="bio" name="bio" label={t("bioLabel")} value={formData.bio} onChange={handleChange} placeholder={t("bioPlaceholder")} />
          </>
        )}

        {role === UserRole.TRAINEE && (
          <>
            <TextField id="birthDate" name="birthDate" label={t("birthDateLabel")} type="date" value={formData.birthDate} onChange={handleChange} />
            <SelectField
              id="gender"
              name="gender"
              label={t("genderLabel")}
              value={formData.gender}
              onChange={handleChange}
              options={[
                { value: Gender.MALE, label: t("male") },
                { value: Gender.FEMALE, label: t("female") },
              ]}
            />
            <NumberField id="weightKg" name="weightKg" label={t("weightLabel")} value={formData.bodyMetrics.weightKg ?? ""} onChange={handleBodyMetricChange} placeholder="70" />
            <NumberField id="heightCm" name="heightCm" label={t("heightLabel")} value={formData.bodyMetrics.heightCm ?? ""} onChange={handleBodyMetricChange} placeholder="175" />
            <NumberField id="targetWeightKg" name="targetWeightKg" label={t("targetWeightLabel")} value={formData.bodyMetrics.targetWeightKg ?? ""} onChange={handleBodyMetricChange} placeholder="65" />
          </>
        )}
      </div>

      <div className="pt-2">
        <Button type="submit" size="lg" disabled={isSubmitting || !isDirty} className="px-8 font-semibold cursor-pointer">
          {isSubmitting ? t("saving") : t("submitButton")}
        </Button>
      </div>
    </form>
  );
}