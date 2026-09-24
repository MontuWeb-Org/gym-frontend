export type NotificationType =
  | "PLAN_ASSIGNED"
  | "PERSONAL_RECORD_ACHIEVED"
  | "PLAN_ADHERENCE_LOW";

interface BaseNotification {
  id: number;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface PlanAssignedPayload {
  planAssignmentId: number;
  planTemplateId: number;
  planName: string;
}

export interface PersonalRecordAchievedPayload {
  personalRecordEventId: number;
  exerciseId: number;
  exerciseName: string;
  setLogId: number;
  weight: number;
  reps: number;
  estimatedOneRm: number;
  isWeightPr: boolean;
  isOneRmPr: boolean;
}

export interface PlanAdherenceLowPayload {
  planAssignmentId: number;
  planTemplateId: number;
  planName: string;
  adherencePercentage: number;
  threshold: number;
}

export type Notification =
  | (BaseNotification & { type: "PLAN_ASSIGNED"; payload: PlanAssignedPayload })
  | (BaseNotification & { type: "PERSONAL_RECORD_ACHIEVED"; payload: PersonalRecordAchievedPayload })
  | (BaseNotification & { type: "PLAN_ADHERENCE_LOW"; payload: PlanAdherenceLowPayload });

export interface OffsetPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetNotificationsQueryParams {
  page?: number;
  limit?: number;
}

export interface GetNotificationsResponse {
  data: {
    unreadCount: number;
    notifications: Notification[];
    pagination: OffsetPagination;
  };
}

export interface MessageResponse {
  message: string;
}