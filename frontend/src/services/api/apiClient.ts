import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
export const apiClient = axios.create({
  baseURL: `${apiUrl}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
interface QueueItem {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use((config) => {
  const isAdminRequest = config.url?.includes("/admin");
  const token = isAdminRequest
    ? (localStorage.getItem("adminAccessToken") || localStorage.getItem("token"))
    : (localStorage.getItem("token") || localStorage.getItem("adminAccessToken"));

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAdminRequest = originalRequest.url?.includes("/admin");
    const hasToken = isAdminRequest 
      ? !!localStorage.getItem("adminAccessToken")
      : !!localStorage.getItem("token");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      if (!hasToken) {
        if (isAdminRequest) {
          window.location.href = `/admin/login?error=restricted`;
        } else {
          window.location.href = `/auth/login?error=restricted`;
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${apiUrl}/api/v1/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        if (isAdminRequest) {
          localStorage.setItem("adminAccessToken", accessToken);
        } else {
          localStorage.setItem("token", accessToken);
        }
        apiClient.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;

        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (isAdminRequest) {
          localStorage.removeItem("adminAccessToken");
          localStorage.removeItem("adminRefreshToken");
          window.location.href = `/admin/login?error=session_expired`;
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = `/auth/login?error=session_expired`;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
