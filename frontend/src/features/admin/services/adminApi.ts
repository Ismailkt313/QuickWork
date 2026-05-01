import axios, { type AxiosResponse } from "axios";
import type { IApiResponse, IPaginatedResponse } from "../../../types/api.types";
import type { IUserListItem, IServiceProviderDetails, IAdminLoginResponse } from "../types/admin.types";
const apiUrl = import.meta.env.VITE_API_URL;
export const Adminapi = axios.create({
  baseURL: `${apiUrl}/api/v1`,

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

 
export const adminLogin = (data: { email: string; password: string }): Promise<AxiosResponse<IApiResponse<IAdminLoginResponse>>> => {
  return Adminapi.post("/auth/admin/login", data);
};

export const getPendingProviders = (params?: {
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<IPaginatedResponse<IUserListItem>>> => {
  return Adminapi.get("/admin/providers/pending", { params });
};

export const approveProvider = (id: string): Promise<AxiosResponse<IApiResponse<void>>> => {
  return Adminapi.patch(`/admin/provider/${id}/approve`);
};


export const rejectProvider = (id: string, reason?: string): Promise<AxiosResponse<IApiResponse<void>>> => {
  return Adminapi.patch(`/admin/provider/${id}/reject`, { reason });
};

export const getUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<AxiosResponse<IPaginatedResponse<IUserListItem>>> => {
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
