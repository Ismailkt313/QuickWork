import { AxiosError } from "axios";
import { api } from "../../../../services/api";
import { ENDPOINTS } from "../../../../constants/endpoints";

export interface ProviderApplicationPayload {
  headline: string;
  about: string;
  profileImage: string;
  skills: string[];
  yearsOfExperience: number;
  hourlyRate: number;
  location: { id: string; name: string; lat?: number; lon?: number };
  portfolio: {
    title: string;
    description: string;
    images: string[];
  }[];
}

export const submitProviderApplication = async (
  data: ProviderApplicationPayload,
): Promise<{ success: boolean; data?: unknown; message?: string }> => {
  try {
    const response = await api.post(ENDPOINTS.PROVIDER.APPLY, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to submit application",
    );
  }
};
