import axios, { type AxiosResponse } from "axios";
import { ENDPOINTS } from "../../../constants/endpoints";
import type { IApiResponse, IPaginatedResponse } from "../../../types/api.types";
import type { IUserListItem, IServiceProviderDetails, IAdminLoginResponse, IUserWithProviderProfile } from "../types/admin.types";
import { jwtDecode } from "jwt-decode";
const apiUrl = import.meta.env.VITE_API_URL;
export const Adminapi = axios.create({
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

Adminapi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminAccessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

Adminapi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token Expired)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/admin/login") &&
      !originalRequest.url?.includes("/refresh-token")
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return Adminapi(originalRequest);
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
        
        // CRITICAL: Check if the refreshed token actually belongs to an admin
        const decoded = jwtDecode<{ role: string }>(accessToken);
        if (decoded.role !== 'admin') {
           throw new Error("Refreshed token is not an admin token");
        }

        localStorage.setItem("adminAccessToken", accessToken);
        Adminapi.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;

        processQueue(null, accessToken);
        return Adminapi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("adminRefreshToken");
        window.location.href = `/admin/login?error=session_expired`;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden (Wrong Role)
    if (error.response?.status === 403 && !originalRequest.url?.includes("/admin/login")) {
      console.warn("Admin access forbidden. Redirecting to login...");
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      window.location.href = `/admin/login?error=unauthorized`;
    }

    return Promise.reject(error);
  },
);

export const adminLogin = (data: { email: string; password: string }): Promise<AxiosResponse<IApiResponse<IAdminLoginResponse>>> => {
  return Adminapi.post(ENDPOINTS.AUTH.ADMIN_LOGIN, data);
};

export const getPendingProviders = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<AxiosResponse<IPaginatedResponse<IUserListItem>>> => {
  return Adminapi.get(ENDPOINTS.ADMIN.PENDING_PROVIDERS, { params });
};

export const approveProvider = (id: string): Promise<AxiosResponse<IApiResponse<void>>> => {
  return Adminapi.patch(ENDPOINTS.ADMIN.APPROVE_PROVIDER(id));
};

export const rejectProvider = (id: string, reason?: string): Promise<AxiosResponse<IApiResponse<void>>> => {
  return Adminapi.patch(ENDPOINTS.ADMIN.REJECT_PROVIDER(id), { reason });
};

export const getUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isBlocked?: boolean;
}): Promise<AxiosResponse<IPaginatedResponse<IUserListItem>>> => {
  return Adminapi.get(ENDPOINTS.ADMIN.USERS, { params });
};

export const toggleBlockUser = (userId: string): Promise<AxiosResponse<IApiResponse<{ isBlocked: boolean }>>> => {
  return Adminapi.patch(ENDPOINTS.ADMIN.BLOCK_USER(userId));
};

export const getProviderById = (providerId: string): Promise<AxiosResponse<IApiResponse<IServiceProviderDetails>>> => {
  return Adminapi.get(ENDPOINTS.ADMIN.PROVIDER_DETAILS(providerId));
};

export const getUserById = (userId: string): Promise<AxiosResponse<IApiResponse<IUserWithProviderProfile>>> => {
  return Adminapi.get(ENDPOINTS.ADMIN.USER_DETAILS(userId));
};

export const adminLogout = (): Promise<AxiosResponse<IApiResponse<void>>> => {
  return Adminapi.post(ENDPOINTS.AUTH.LOGOUT);
};
