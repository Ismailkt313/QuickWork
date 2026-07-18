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

import { Request, Response, NextFunction } from 'express';

export interface IAdminDashboardController {
    getOverview(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRecentActivity(req: Request, res: Response, next: NextFunction): Promise<void>;
    getChartData(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFinanceSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
}
