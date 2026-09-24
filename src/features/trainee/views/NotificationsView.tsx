"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  selectNotifications,
  selectUnreadCount,
  selectNotificationsPagination,
} from "@/features/trainee/store/notification.slice";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { NotificationsHeader } from "../components/notification/NotificationsHeader";
import { NotificationsList } from "../components/notification/NotificationsList";

export default function NotificationsView() {
  const dispatch = useAppDispatch();
  const t = useTranslations("Notifications");

  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const pagination = useAppSelector(selectNotificationsPagination);
  const isLoading = useAppSelector((state) => state.notifications.isLoading);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleMarkAsRead = (id: number) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.totalPages) {
      dispatch(fetchNotifications({ page: pagination.page + 1, limit: pagination.limit }));
    }
  };

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  return (
    <div className="space-y-6">
      
      <NotificationsHeader unreadCount={unreadCount} onMarkAllAsRead={handleMarkAllAsRead} />

      <Card>
        <ScrollArea className="max-h-[600px]">
          <NotificationsList
            notifications={notifications}
            isLoading={isLoading}
            onMarkAsRead={handleMarkAsRead}
          />
        </ScrollArea>
        {hasMore && (
          <CardContent className="border-t p-3">
            <Button variant="outline" className="w-full" onClick={handleLoadMore} disabled={isLoading}>
              {t("loadMore")}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}