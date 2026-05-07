import { Adminapi } from './adminApi';
import { ENDPOINTS } from '../../../constants/endpoints';

export const adminFinanceService = {

    getOverview: async () => {
        const response = await Adminapi.get(ENDPOINTS.ADMIN.FINANCE_OVERVIEW);
        return response.data;
    },

    getTransactions: async (params: {
        page?: number;
        limit?: number;
        paymentMethod?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
    }) => {
        const response = await Adminapi.get(ENDPOINTS.ADMIN.FINANCE_TRANSACTIONS, { params });
        return response.data;
    }
};
