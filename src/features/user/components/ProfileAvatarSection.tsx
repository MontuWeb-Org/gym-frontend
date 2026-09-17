"use client";

import React, { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, User } from "lucide-react";

interface ProfileAvatarSectionProps {
  avatarUrl?: string;
  fallbackName?: string;
  onPhotoChange?: (file: File) => void;
  disabled?: boolean;
}

export function ProfileAvatarSection({
  avatarUrl,
  fallbackName = "User",
  onPhotoChange,
  disabled = false,
}: ProfileAvatarSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPhotoChange) {
      onPhotoChange(file);
    }
  };

  return (
    <div className="flex items-center gap-5">
      <Avatar className="size-24 border border-border shadow-xs">
        <AvatarImage src={avatarUrl} alt={fallbackName} className="object-cover" />
        <AvatarFallback className="bg-muted text-muted-foreground text-xl font-semibold">
          <User className="size-10" />
        </AvatarFallback>
      </Avatar>

      <div className="space-y-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="border-dashed gap-2 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="size-4 text-muted-foreground" />
          Change photo
        </Button>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or GIF. 2MB max.
        </p>
      </div>
    </div>
  );
}