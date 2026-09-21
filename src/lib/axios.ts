import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { tokenStorage } from "./storage";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export const publicApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Separate client for refresh requests.
 *
 * This prevents the refresh request itself from recursively
 * triggering the 401 refresh interceptor.
 */
const refreshApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const currentToken = tokenStorage.getAccessToken();

  const response = await refreshApi.post(
    "/api/auth/refresh-token",
    {},
    {
      headers: currentToken
        ? {
            Authorization: `Bearer ${currentToken}`,
          }
        : undefined,
    }
  );

  const newAccessToken = response.data?.data?.accessToken;

  if (!newAccessToken) {
    throw new Error("Refresh response did not contain an access token.");
  }

  tokenStorage.setAccessToken(newAccessToken);

  return newAccessToken;
}

authApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);

authApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // Never retry the same request more than once.
    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return authApi(originalRequest);
    } catch (refreshError) {
      tokenStorage.clearTokens();

      return Promise.reject(refreshError);
    }
  }
);