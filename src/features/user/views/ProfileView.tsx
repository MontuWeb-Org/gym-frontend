"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCurrentUser, updateUserThunk } from "@/features/user/store/user.slice";
import { UpdateProfilePayload, UserRole } from "@/features/user/types/user.types";
import { ProfileAvatarSection } from "../components/ProfileAvatarSection";
import { ProfileForm, ProfileFormData } from "../components/ProfileForm";

interface ProfileViewProps {
  avatarUrl?: string;
  onPhotoChange?: (file: File) => void;
}

export function ProfileView({ avatarUrl, onPhotoChange }: ProfileViewProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  if (!user || user.role === UserRole.ADMIN) return null;

  const initialData: Partial<ProfileFormData> =
  user.role === UserRole.TRAINER
    ? {
        name: user.name,
        phoneNumber: user.phoneNumber,
        bio: user.profile.bio ?? "",
        experience: user.profile.experience ?? "",
      }
    : {
        name: user.name,
        phoneNumber: user.phoneNumber,
        birthDate: user.profile.birthDate,
        gender: user.profile.gender,
        bodyMetrics: user.profile.bodyMetrics,
      };

  const handleSubmit = async (data: ProfileFormData) => {
  const payload: UpdateProfilePayload =
    user.role === UserRole.TRAINER
      ? {
          name: data.name,
          phoneNumber: data.phoneNumber,
          profile: { bio: data.bio, experience: data.experience },
        }
      : {
          name: data.name,
          phoneNumber: data.phoneNumber,
          profile: {
            birthDate: data.birthDate,
            gender: data.gender,
            bodyMetrics: data.bodyMetrics,
          },
        };
  await dispatch(updateUserThunk(payload)).unwrap();
};

  return (
    <div className="space-y-8 max-w-3xl">
      <ProfileAvatarSection avatarUrl={avatarUrl} fallbackName={user.name} onPhotoChange={onPhotoChange} />
      <ProfileForm role={user.role} initialData={initialData} onSubmit={handleSubmit} />
    </div>
  );
}