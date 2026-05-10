import { Request, Response, NextFunction } from 'express';

export interface IDashboardOverview {
    totalEarnings: number;
    walletBalance: number;
    activeJobs: number;
    completedJobs: number;
    pendingAssignments: number;
    averageRating: number;
    totalReviews: number;
    upcomingJobs: number;
    totalAssignments: number;
}

export interface IPerformanceStats {
    completionRate: number;
    acceptanceRate: number;
    averageRating: number;
    totalReviews: number;
}

export interface IChartData {
    monthlyEarnings: { month: string; amount: number }[];
    jobStatusDistribution: { status: string; count: number }[];
    weeklyWorkActivity: { day: string; count: number }[];
}

export interface IAvailabilitySummary {
    availableToday: boolean;
    nextBlockedDate: Date | null;
    weeklyAvailability: any[];
}

export interface IProviderDashboardService {
    getOverview(userId: string): Promise<IDashboardOverview>;
    getActivity(userId: string): Promise<any>;
    getCharts(userId: string): Promise<IChartData>;
    getPerformance(userId: string): Promise<IPerformanceStats>;
    getAvailabilitySummary(userId: string): Promise<IAvailabilitySummary>;
}

export interface IProviderDashboardController {
    getOverview(req: Request, res: Response, next: NextFunction): Promise<void>;
    getActivity(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCharts(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPerformance(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAvailabilitySummary(req: Request, res: Response, next: NextFunction): Promise<void>;
}
