import { authApi } from "@/lib/axios";
import {
  GetNotificationsQueryParams,
  GetNotificationsResponse,
  MessageResponse,
} from "../types/notification.types";

export const notificationService = {
  async getNotifications(params?: GetNotificationsQueryParams): Promise<GetNotificationsResponse> {
    const response = await authApi.get<GetNotificationsResponse>("/notifications", {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });
    return response.data;
  },

  async markAllAsRead(): Promise<MessageResponse> {
    const response = await authApi.patch<MessageResponse>("/notifications/read-all");
    return response.data;
  },

  async markAsRead(notificationId: number): Promise<MessageResponse> {
    const response = await authApi.patch<MessageResponse>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },
};