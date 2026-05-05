import { api } from "../../../../services/api";
import { ENDPOINTS } from "../../../../constants/endpoints";

export interface ProviderItem {
  id: string;
  headline: string;
  profileImage: string;
  hourlyRate: number;
  yearsOfExperience: number;
  location: { id: string; name: string; lat: number; lon: number };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProvidersResponse {
  success: boolean;
  data: ProviderItem[];
  pagination: PaginationInfo;
}

export const getProviders = async (params: {
  skillId: string;
  locationId?: string;
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}): Promise<ProvidersResponse> => {
  const response = await api.get(ENDPOINTS.PROVIDER.LIST, { params });
  return response.data;
};

export const getProviderById = async <T = unknown>(id: string): Promise<{ success: boolean; data: T; message?: string }> => {
  const response = await api.get(ENDPOINTS.PROVIDER.DETAILS(id));
  return response.data;
};
