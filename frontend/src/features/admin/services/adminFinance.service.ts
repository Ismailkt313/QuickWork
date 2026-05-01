import { Adminapi } from './adminApi';

export const adminFinanceService = {
    
    getOverview: async () => {
        const response = await Adminapi.get('/admin/finance/overview');
        return response.data;
    },

    
    getTransactions: async (params: {
        page?: number;
        limit?: number;
        paymentMethod?: string;
        startDate?: string;
        endDate?: string;
    }) => {
        const response = await Adminapi.get('/admin/finance/transactions', { params });
        return response.data;
    }
};
