import { Request, Response, NextFunction } from 'express';
import { IAvailability } from '../../serviceProvider/interfaces/serviceProvider.interface';

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
    weeklyAvailability: IAvailability[];
}

export interface IProviderDashboardService {
    getOverview(userId: string): Promise<IDashboardOverview>;
    getActivity(userId: string): Promise<{ recentAssignments: unknown[]; recentReviews: unknown[]; recentNotifications: unknown[] }>;
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
