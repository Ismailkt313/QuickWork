import { Adminapi } from './adminApi';

export const adminReportService = {
    getReports: async (params: { status?: string; page?: number; limit?: number }) => {
        const response = await Adminapi.get('/admin/reports', { params });
        return response.data;
    },

    getReportDetail: async (reportId: string) => {
        const response = await Adminapi.get(`/admin/reports/${reportId}`);
        return response.data;
    },

    takeAction: async (reportId: string, data: { action: string; reason: string }) => {
        const response = await Adminapi.post(`/admin/reports/${reportId}/action`, data);
        return response.data;
    }
};
