import { Adminapi as api } from "../services/adminApi";
import { ENDPOINTS } from "../../../constants/endpoints";

export interface DashboardOverview {
    totalUsers: number;
    totalProviders: number;
    activeJobs: number;
    completedJobs: number;
    pendingProviderApprovals: number;
    totalPlatformEarnings: number;
    pendingReports: number;
    totalTransactions: number;
}

export interface RecentActivity {
    id: string;
    type: 'registration' | 'approval' | 'payment' | 'report' | 'moderation';
    title: string;
    description: string;
    timestamp: string;
    user?: {
        name: string;
        avatar?: string;
    };
}

export interface ChartData {
    jobStatusDistribution: { status: string; count: number }[];
    monthlyRevenue: { month: string; revenue: number }[];
    userProviderGrowth: { month: string; users: number; providers: number }[];
}

export interface FinanceSummary {
    totalEarnings: number;
    totalPayouts: number;
    pendingWithdrawals: number;
    transactionVolume: number;
}

export const adminDashboardService = {
    getOverview: async () => {
        const response = await api.get(ENDPOINTS.ADMIN.DASHBOARD_OVERVIEW);
        return response.data;
    },
    getRecentActivity: async () => {
        const response = await api.get(ENDPOINTS.ADMIN.DASHBOARD_ACTIVITY);
        return response.data;
    },
    getChartData: async () => {
        const response = await api.get(ENDPOINTS.ADMIN.DASHBOARD_CHARTS);
        return response.data;
    },
    getFinanceSummary: async () => {
        const response = await api.get(ENDPOINTS.ADMIN.DASHBOARD_FINANCE);
        return response.data;
    }
};
