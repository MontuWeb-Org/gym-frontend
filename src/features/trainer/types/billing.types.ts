export type PaymentStatus = "PAID" | "NOT_PAID";
export type LifecycleStatus = "ACTIVE" | "COMPLETED" | "CANCELED";

export interface SubscriptionPlan {
  id: number;
  name: string;
  maxTrainees: number;
  price: number;
  billingPeriod: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerSubscription {
  trainerId: number;
  subscriptionPlanId: number;
  paymentStatus: PaymentStatus;
  lifecycleStatus: LifecycleStatus;
  createdAt: string;
  updatedAt: string;
  subscriptionPlan?: SubscriptionPlan;
}

export interface BillingHistoryQuery {
  paymentStatus?: PaymentStatus;
  lifecycleStatus?: LifecycleStatus;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "totalAmount";
  sortOrder?: "asc" | "desc";
}

export interface BillingHistoryResponse {
  data: TrainerSubscription[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
