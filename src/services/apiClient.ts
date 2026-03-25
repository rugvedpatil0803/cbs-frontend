import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { decryptData, encryptData } from "../utils/cryptoUtils";

const BASE_URL = 'http://localhost:8080/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = []; 
};

// ==========================
// ✅ REQUEST INTERCEPTOR
// ==========================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const encryptedToken = localStorage.getItem("token");

    const token = encryptedToken ? decryptData(encryptedToken) : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Cache-Control"] =
      "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================
// 🔥 RESPONSE INTERCEPTOR
// ==========================
apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = "Bearer " + token;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const encryptedRefresh = localStorage.getItem("refreshToken");
      const refreshToken = encryptedRefresh
        ? decryptData(encryptedRefresh)
        : null;

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const newToken = res.data?.data?.token;

        localStorage.setItem("token", encryptData(newToken));

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);

      } catch (err) {
        processQueue(err, null);

        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;