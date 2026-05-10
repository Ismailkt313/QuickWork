import { IApiResponse } from "../../../types/api.types";

export interface IAdminDashboardOverview {
    totalUsers: number;
    totalProviders: number;
    activeJobs: number;
    completedJobs: number;
    pendingProviderApprovals: number;
    totalPlatformEarnings: number;
    pendingReports: number;
    totalTransactions: number;
}

export interface IRecentActivity {
    id: string;
    type: 'registration' | 'approval' | 'payment' | 'report' | 'moderation';
    title: string;
    description: string;
    timestamp: Date;
    user?: {
        name: string;
        avatar?: string;
    };
}

export interface IChartData {
    jobStatusDistribution: { status: string; count: number }[];
    monthlyRevenue: { month: string; revenue: number }[];
    userProviderGrowth: { month: string; users: number; providers: number }[];
}

export interface IFinanceSummary {
    totalEarnings: number;
    totalPayouts: number;
    pendingWithdrawals: number;
    transactionVolume: number;
}

export interface IAdminDashboardService {
    getOverview(): Promise<IApiResponse<IAdminDashboardOverview>>;
    getRecentActivity(): Promise<IApiResponse<IRecentActivity[]>>;
    getChartData(): Promise<IApiResponse<IChartData>>;
    getFinanceSummary(): Promise<IApiResponse<IFinanceSummary>>;
}

export interface IAdminDashboardController {
    getOverview(req: any, res: any, next: any): Promise<void>;
    getRecentActivity(req: any, res: any, next: any): Promise<void>;
    getChartData(req: any, res: any, next: any): Promise<void>;
    getFinanceSummary(req: any, res: any, next: any): Promise<void>;
}
