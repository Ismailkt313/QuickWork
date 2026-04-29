import { apiClient } from "../../../../../services/api/apiClient";

export interface CreateJobData {
  title: string;
  description: string;
  contactNumber: string;
  skillId: string;
  location: {
    district: string;
    districtName: string;
    address: string;
    additionalDetails?: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  budget: { min: number; max: number };

  durationType: string;
  startDate?: string;
  days?: number;
  freelancersNeeded: number;
  visibility?: "public" | "private";
  hiredProviderId?: string;
  isUrgent?: boolean;
}
export class JobRepository {
  static async createJob(
    jobData: CreateJobData,
  ): Promise<{ success: boolean; message: string; data?: unknown }> {
    try {
      const response = await apiClient.post("/job", jobData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create job";
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}
