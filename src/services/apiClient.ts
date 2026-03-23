import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

// 🔁 Refresh control
let isRefreshing = false;
let failedQueue: any[] = [];

// Process queued requests
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
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================
// 🔥 RESPONSE INTERCEPTOR
// ==========================
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ❗ If token expired (401)
    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = "Bearer " + token;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      try {
        // 🔁 Call refresh API
        const res = await axios.post(
          "http://localhost:8080/auth/refresh",
          { refreshToken }
        );

        const newToken = res.data.data.token;

        // ✅ Save new token
        localStorage.setItem("token", newToken);

        // ✅ Retry all failed requests
        processQueue(null, newToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);

      } catch (err) {
        processQueue(err, null);

        // ❌ Logout if refresh fails
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