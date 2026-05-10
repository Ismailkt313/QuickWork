import { api } from "../../../services/api";

export const providerDashboardService = {
  getOverview: async () => {
    const response = await api.get("/provider/dashboard/overview");
    return response.data;
  },

  getActivity: async () => {
    const response = await api.get("/provider/dashboard/activity");
    return response.data;
  },

  getCharts: async () => {
    const response = await api.get("/provider/dashboard/charts");
    return response.data;
  },

  getPerformance: async () => {
    const response = await api.get("/provider/dashboard/performance");
    return response.data;
  },

  getAvailabilitySummary: async () => {
    const response = await api.get("/provider/dashboard/availability-summary");
    return response.data;
  },
};
