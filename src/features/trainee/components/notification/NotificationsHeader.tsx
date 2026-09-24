"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCheck } from "lucide-react";

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export function NotificationsHeader({ unreadCount, onMarkAllAsRead }: NotificationsHeaderProps) {
  const t = useTranslations("Notifications");

  return (
    <PageHeader
      title={t("title")}
      actions={
        <>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount}</Badge>}
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="gap-1.5">
              <CheckCheck className="h-4 w-4" />
              {t("markAllRead")}
            </Button>
          )}
        </>
      }
    />
  );
}