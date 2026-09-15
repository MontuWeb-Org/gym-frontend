"use client";

import { ProfileView } from "@/features/user/views/ProfileView";

export default function TrainerProfilePage() {
  return (
    <ProfileView
      showBusinessName={true}
      onSubmit={(data) => console.log("Trainer Profile Saved:", data)}
      onPhotoChange={(file) => console.log("Trainer Photo Updated:", file)}
    />
  );
}