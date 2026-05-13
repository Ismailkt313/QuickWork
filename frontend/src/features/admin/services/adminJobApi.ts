import { apiClient } from "../../../services/api/apiClient";

export interface AdminJobFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  visibility?: string;
  type?: 'disputed' | 'flagged' | 'stalled' | 'payments';
  skillId?: string;
  minBudget?: number;
  maxBudget?: number;
}

export const adminJobApi = {
  getAllJobs: async (filters: AdminJobFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, value.toString());
      }
    });
    const response = await apiClient.get(`/admin/jobs?${params.toString()}`);
    return response.data;
  },

  getJobDetails: async (jobId: string) => {
    const response = await apiClient.get(`/admin/jobs/${jobId}`);
    return response.data;
  },

  cancelJob: async (jobId: string, reason: string) => {
    const response = await apiClient.patch(`/admin/jobs/${jobId}/cancel`, { reason });
    return response.data;
  }
};
