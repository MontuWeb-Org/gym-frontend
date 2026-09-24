import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationService } from "../services/notification.service";
import {
    Notification,
    OffsetPagination,
    GetNotificationsQueryParams,
} from "../types/notification.types";

interface NotificationsState {
    notifications: Notification[];
    unreadCount: number;
    pagination: OffsetPagination | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: NotificationsState = {
    notifications: [],
    unreadCount: 0,
    pagination: null,
    isLoading: false,
    error: null,
};

const getErrorMessage = (err: unknown): string => {
    const error = err as { response?: { data?: { message?: string } } };
    return error.response?.data?.message || "An error occurred";
};

export const fetchNotifications = createAsyncThunk(
    "notifications/fetchNotifications",
    async (params: GetNotificationsQueryParams | undefined, { rejectWithValue }) => {
        try {
            return await notificationService.getNotifications(params);
        } catch (err) {
            return rejectWithValue(getErrorMessage(err) || "Failed to fetch notifications");
        }
    }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId);
      return notificationId;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err) || "Failed to mark notification as read");
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
    "notifications/markAllAsRead",
    async (_, { rejectWithValue }) => {
        try {
            await notificationService.markAllAsRead();
        } catch (err) {
            return rejectWithValue(getErrorMessage(err) || "Failed to mark all notifications as read");
        }
    }
);

const notificationsSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        clearNotificationsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                const { notifications, unreadCount, pagination } = action.payload.data;
                state.notifications =
                    pagination.page > 1 ? [...state.notifications, ...notifications] : notifications;
                state.unreadCount = unreadCount;
                state.pagination = pagination;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) || "An error occurred";
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const notif = state.notifications.find((n) => n.id === action.payload);
                if (notif && !notif.isRead) {
                    notif.isRead = true;
                    notif.readAt = new Date().toISOString();
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.notifications.forEach((n) => {
                    n.isRead = true;
                });
                state.unreadCount = 0;
            });
    },
});

export const { clearNotificationsError } = notificationsSlice.actions;
export default notificationsSlice.reducer;

export const selectNotifications = (state: { notifications: NotificationsState }) =>
    state.notifications.notifications;
export const selectUnreadCount = (state: { notifications: NotificationsState }) =>
    state.notifications.unreadCount;
export const selectNotificationsPagination = (state: { notifications: NotificationsState }) =>
    state.notifications.pagination;;