import { IAdminDashboardService, IAdminDashboardOverview, IRecentActivity, IChartData, IFinanceSummary } from "../interfaces/adminDashboard.interface";
import { UserModel } from "../../auth/models/user.model";
import { ServiceProviderModel } from "../../serviceProvider/models/serviceProvider.model";
import { JobModel } from "../../job/models/job.model";
import { ReportModel } from "../../report/models/report.model";
import { PlatformTransactionModel } from "../../finance/models/platformTransaction.model";
import { WalletTransactionModel } from "../../finance/models/walletTransaction.model";
import { IApiResponse } from "../../../types/api.types";
import { JOB_STATUS } from "../../../constants/jobStatus";
import { VERIFICATION_STATUS } from "../../../constants/verification";

export class AdminDashboardService implements IAdminDashboardService {
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
            UserModel.countDocuments(),
            ServiceProviderModel.countDocuments(),
            JobModel.countDocuments({ status: { $in: [JOB_STATUS.OPEN, JOB_STATUS.PARTIALLY_ASSIGNED, JOB_STATUS.FULLY_ASSIGNED, JOB_STATUS.IN_PROGRESS] } }),
            JobModel.countDocuments({ status: JOB_STATUS.COMPLETED }),
            ServiceProviderModel.countDocuments({ 'verification.status': VERIFICATION_STATUS.PENDING }),
            ReportModel.countDocuments({ status: 'PENDING' }),
            PlatformTransactionModel.countDocuments(),
            PlatformTransactionModel.aggregate([
                { $group: { _id: null, total: { $sum: "$platformFee" } } }
            ])
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
            UserModel.find().sort({ createdAt: -1 }).limit(5),
            ServiceProviderModel.find().populate('userId').sort({ createdAt: -1 }).limit(5),
            PlatformTransactionModel.find().populate('providerId').sort({ createdAt: -1 }).limit(5),
            ReportModel.find().populate('reporterId').sort({ createdAt: -1 }).limit(5)
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
        const jobStatusDistribution = await JobModel.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: 1 } }
        ]);

        const monthlyRevenue = await PlatformTransactionModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    revenue: { $sum: "$platformFee" }
                }
            },
            { $sort: { "_id": 1 } },
            { $project: { _id: 0, month: "$_id", revenue: 1 } }
        ]);

        const userGrowth = await UserModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const providerGrowth = await ServiceProviderModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
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
        const [totals] = await Promise.all([
            PlatformTransactionModel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalEarnings: { $sum: "$platformFee" },
                        totalPayouts: { $sum: "$providerAmount" },
                        transactionVolume: { $sum: "$totalAmount" }
                    }
                }
            ])
        ]);

        return {
            success: true,
            message: "Finance summary fetched successfully",
            data: {
                totalEarnings: totals[0]?.totalEarnings || 0,
                totalPayouts: totals[0]?.totalPayouts || 0,
                pendingWithdrawals: 0,
                transactionVolume: totals[0]?.transactionVolume || 0
            }
        };
    }
}
