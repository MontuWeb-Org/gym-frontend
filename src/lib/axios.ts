import axios, { AxiosError, AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    }

    const isHtmlError =
      typeof error.response?.data === "string" &&
      error.response.data.includes("<!DOCTYPE html>");

    const formattedError = isHtmlError
      ? `Route not found (${error.response?.status}): Check endpoint path or server port.`
      : error.response?.data || error.message;

    console.error("[API Error]", formattedError);
    return Promise.reject(error);
  }
);

export default apiClient;