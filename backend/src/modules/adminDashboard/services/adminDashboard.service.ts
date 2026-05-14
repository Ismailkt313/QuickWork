import { IAdminDashboardService, IAdminDashboardOverview, IRecentActivity, IChartData, IFinanceSummary } from "../interfaces/adminDashboard.interface";
import { IAuthRepository } from "../../auth/interfaces/auth.interface";
import { IJobRepository } from "../../job/interfaces/job.interface";
import { IServiceProviderRepository } from "../../serviceProvider/interfaces/serviceProvider.interface";
import { IReportRepository } from "../../report/interfaces/report.interface";
import { IPlatformTransactionRepository } from "../../finance/interfaces/finance.interface";
import { IApiResponse } from "../../../types/api.types";

export class AdminDashboardService implements IAdminDashboardService {
    constructor(
        private readonly _authRepo: IAuthRepository,
        private readonly _jobRepo: IJobRepository,
        private readonly _providerRepo: IServiceProviderRepository,
        private readonly _reportRepo: IReportRepository,
        private readonly _transactionRepo: IPlatformTransactionRepository
    ) { }

    public async getOverview(): Promise<IApiResponse<IAdminDashboardOverview>> {
        const [
            totalUsers,
            totalProviders,
            activeJobs,
            completedJobs,
            pendingProviderApprovals,
            pendingReports,
            totalTransactions,
            earningsData
        ] = await Promise.all([
            this._authRepo.countTotalUsers(),
            this._providerRepo.countTotalProviders(),
            this._jobRepo.countActiveJobs(),
            this._jobRepo.countCompletedJobs(),
            this._providerRepo.countPendingApprovals(),
            this._reportRepo.countPendingReports(),
            this._transactionRepo.countTotalTransactions(),
            this._transactionRepo.getEarningsStats()
        ]);

        return {
            success: true,
            message: "Dashboard overview fetched successfully",
            data: {
                totalUsers,
                totalProviders,
                activeJobs,
                completedJobs,
                pendingProviderApprovals,
                totalPlatformEarnings: earningsData[0]?.total || 0,
                pendingReports,
                totalTransactions
            }
        };
    }

    public async getRecentActivity(): Promise<IApiResponse<IRecentActivity[]>> {
        const [
            newUsers,
            newProviders,
            recentTransactions,
            recentReports
        ] = await Promise.all([
            this._authRepo.getRecentUsers(5),
            this._providerRepo.getRecentProviders(5),
            this._transactionRepo.getRecentTransactions(5),
            this._reportRepo.getRecentReports(5)
        ]);

        const activities: IRecentActivity[] = [];

        newUsers.forEach(u => activities.push({
            id: u._id.toString(),
            type: 'registration',
            title: 'New User Registration',
            description: `${u.name || 'Unknown'} registered as a user`,
            timestamp: u.createdAt as Date,
            user: { name: u.name || 'Unknown', avatar: u.profileImage?.url }
        }));

        newProviders.forEach(p => {
            const user = p.userId as any;
            activities.push({
                id: p._id.toString(),
                type: 'approval',
                title: 'Provider Application',
                description: `${user?.name || 'Unknown'} submitted provider application`,
                timestamp: p.createdAt as Date,
                user: { name: user?.name || 'Unknown', avatar: user?.profileImage?.url }
            });
        });

        recentTransactions.forEach(t => {
            const provider = t.providerId as any;
            activities.push({
                id: t._id.toString(),
                type: 'payment',
                title: 'Payment Completed',
                description: `Platform fee of ₹${t.platformFee} received`,
                timestamp: t.createdAt,
                user: { name: provider?.name || 'System', avatar: provider?.profileImage?.url }
            });
        });

        recentReports.forEach(r => {
            const reporter = r.reporterId as any;
            activities.push({
                id: r._id.toString(),
                type: 'report',
                title: 'New Report Filed',
                description: r.reason,
                timestamp: r.createdAt as Date,
                user: { name: reporter?.name || 'Unknown', avatar: reporter?.profileImage?.url }
            });
        });

        return {
            success: true,
            message: "Recent activity fetched successfully",
            data: activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10)
        };
    }

    public async getChartData(): Promise<IApiResponse<IChartData>> {
        const [
            jobStatusDistribution,
            monthlyRevenue,
            userGrowth,
            providerGrowth
        ] = await Promise.all([
            this._jobRepo.getStatusDistribution(),
            this._transactionRepo.getMonthlyRevenue(),
            this._authRepo.getUserGrowth(),
            this._providerRepo.getProviderGrowth()
        ]);

        // Merge growth data
        const allMonths = Array.from(new Set([...userGrowth.map(u => u._id), ...providerGrowth.map(p => p._id)])).sort();
        const userProviderGrowth = allMonths.map(month => ({
            month,
            users: userGrowth.find(u => u._id === month)?.count || 0,
            providers: providerGrowth.find(p => p._id === month)?.count || 0
        }));

        return {
            success: true,
            message: "Chart data fetched successfully",
            data: {
                jobStatusDistribution,
                monthlyRevenue,
                userProviderGrowth
            }
        };
    }

    public async getFinanceSummary(): Promise<IApiResponse<IFinanceSummary>> {
        const totals = await this._transactionRepo.getFinanceSummary();

        return {
            success: true,
            message: "Finance summary fetched successfully",
            data: {
                totalEarnings: totals?.totalEarnings || 0,
                totalPayouts: totals?.totalPayouts || 0,
                pendingWithdrawals: 0,
                transactionVolume: totals?.transactionVolume || 0
            }
        };
    }
}
