import { authApi } from "@/lib/axios";
import type { TraineePerformanceAnalytics } from "../types/analytics.types";

const ANALYTICS_ENDPOINT = "/users/performance/mine";

interface AnalyticsApiResponse {
  data: TraineePerformanceAnalytics;
}

export const analyticsService = {
  async getMyPerformance(): Promise<TraineePerformanceAnalytics> {
    const response = await authApi.get<AnalyticsApiResponse>(
      ANALYTICS_ENDPOINT,
    );

    return response.data.data;
  },
};