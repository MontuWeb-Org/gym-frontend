"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { BellOff } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { Notification } from "../../types/notification.types";

interface NotificationsListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: number) => void;
}

export function NotificationsList({ notifications, isLoading, onMarkAsRead }: NotificationsListProps) {
  const t = useTranslations("Notifications");

  if (isLoading && notifications.length === 0) {
    return (
      <div className="space-y-3 p-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <BellOff className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onMarkAsRead={onMarkAsRead} />
      ))}
    </div>
  );
}