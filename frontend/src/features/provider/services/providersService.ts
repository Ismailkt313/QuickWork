import { api } from "../../../services/api";

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
  providers: ProviderItem[];
  pagination: PaginationInfo;
}

export const getProviders = async (params: {
  skillId: string;
  locationId?: string;
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<ProvidersResponse> => {
  const response = await api.get("/provider/list", { params });
  return response.data;
};

export const getProviderById = async (id: string): Promise<any> => {
  const response = await api.get(`/provider/${id}`);
  return response.data;
};
