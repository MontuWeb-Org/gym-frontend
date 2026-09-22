"use client";

import { useTranslations } from "next-intl";
import { NotificationIcon } from "./NotificationIcon";
import { Notification } from "../../types/notification.types";
import { cn } from "@/lib/cn";

function getMessage(notification: Notification, t: ReturnType<typeof useTranslations>) {
  switch (notification.type) {
    case "PLAN_ASSIGNED":
      return t("planAssigned", { planName: notification.payload.planName });
    case "PERSONAL_RECORD_ACHIEVED":
      return t("personalRecord", { exerciseName: notification.payload.exerciseName });
    case "PLAN_ADHERENCE_LOW":
      return t("adherenceLow", {
        planName: notification.payload.planName,
        percentage: notification.payload.adherencePercentage,
      });
  }
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const t = useTranslations("Notifications");

  return (
    <button
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg p-3 text-start transition-colors hover:bg-accent",
        !notification.isRead && "bg-accent/50"
      )}
    >
      <NotificationIcon type={notification.type} />
      <div className="flex-1 space-y-1">
        <p className={cn("text-sm", !notification.isRead && "font-medium")}>
          {getMessage(notification, t)}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
      {!notification.isRead && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
      )}
    </button>
  );
}