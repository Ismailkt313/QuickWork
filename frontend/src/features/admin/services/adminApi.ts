import axios, { type AxiosResponse } from "axios";
import type { IApiResponse, IPaginatedResponse } from "../../../types/api.types";
import type { IUserListItem, IServiceProviderDetails, IAdminLoginResponse } from "../types/admin.types";
const apiUrl = import.meta.env.VITE_API_URL;
console.log(apiUrl, "API URL is here");

export const Adminapi = axios.create({
  baseURL: `${apiUrl}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});
Adminapi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminAccessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Removed IUserListItem from here as it's moved to admin.types.ts

export const adminLogin = (data: { email: string; password: string }): Promise<AxiosResponse<IApiResponse<IAdminLoginResponse>>> => {
  return Adminapi.post("/auth/admin/login", data);
};

export const getPendingProviders = (): Promise<AxiosResponse<IPaginatedResponse<IUserListItem>>> => {
  return Adminapi.get("/admin/providers/pending");
};

export const approveProvider = (id: string): Promise<AxiosResponse<IApiResponse<void>>> => {
  const response = Adminapi.patch(`/admin/provider/${id}/approve`);
  console.log(response, "response is here");
  return response;
};

export const rejectProvider = (id: string, reason?: string): Promise<AxiosResponse<IApiResponse<void>>> => {
  return Adminapi.patch(`/admin/provider/${id}/reject`, { reason });
};

export const getUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<AxiosResponse<IPaginatedResponse<IUserListItem>>> => {
  const tocken = localStorage.getItem("adminAccessToken");

  console.log("Admin Access Token:", tocken);
  return Adminapi.get("/admin/users", { params });
};

export const toggleBlockUser = (userId: string): Promise<AxiosResponse<IApiResponse<{ isBlocked: boolean }>>> => {
  return Adminapi.patch(`/admin/users/${userId}/block`);
};

export const getProviderById = (providerId: string): Promise<AxiosResponse<IApiResponse<IServiceProviderDetails>>> => {
  return Adminapi.get(`/admin/provider/${providerId}`);
};

export const getUserById = (userId: string): Promise<AxiosResponse<IApiResponse<IUserListItem>>> => {
  return Adminapi.get(`/admin/user/${userId}`);
};
