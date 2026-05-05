import { Adminapi } from './adminApi';
import { ENDPOINTS } from '../../../constants/endpoints';

export const adminReportService = {
    getReports: async (params: { status?: string; page?: number; limit?: number }) => {
        const response = await Adminapi.get(ENDPOINTS.ADMIN.REPORTS, { params });
        return response.data;
    },

    getReportDetail: async (reportId: string) => {
        const response = await Adminapi.get(ENDPOINTS.ADMIN.REPORT_DETAILS(reportId));
        return response.data;
    },

    takeAction: async (reportId: string, data: { action: string; reason: string }) => {
        const response = await Adminapi.post(ENDPOINTS.ADMIN.REPORT_ACTION(reportId), data);
        return response.data;
    }
};
