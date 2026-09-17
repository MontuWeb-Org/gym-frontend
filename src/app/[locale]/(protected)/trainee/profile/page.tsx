"use client";

import { ProfileView } from "@/features/user/views/ProfileView";

export default function TrainerProfilePage() {
  return (
    <ProfileView
      onPhotoChange={(file) => console.log("Trainer Photo Updated:", file)}
    />
  );
}