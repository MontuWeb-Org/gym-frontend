import axios, { AxiosInstance } from "axios";
import { tokenStorage } from "./storage";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

// 1. Unauthenticated Instance (Public endpoints)
export const publicApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 2. Authenticated Instance (Protected endpoints)
export const authApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Automatically inject Bearer Token into authApi requests
authApi.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses for authApi requests
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clearTokens();
    }
    return Promise.reject(error);
  }
);