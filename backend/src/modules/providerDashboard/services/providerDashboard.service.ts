import mongoose from 'mongoose';
import { IProviderDashboardService, IDashboardOverview, IPerformanceStats, IChartData, IAvailabilitySummary } from '../interfaces/providerDashboard.interface';
import { ServiceProviderModel } from '../../serviceProvider/models/serviceProvider.model';
import { AssignmentModel } from '../../assignment/models/assignment.model';
import { WorkHistoryModel } from '../../finance/models/workHistory.model';
import { WalletModel } from '../../finance/models/wallet.model';
import { ReviewModel } from '../../review/models/review.model';
import { NotificationModel } from '../../notification/models/notification.model';
import { ASSIGNMENT_STATUS, WORK_STATUS } from '../../../constants/assignment';
import { AppError } from '../../../utils/AppError';
import { HttpStatusCode } from '../../../constants/httpStatusCode';

export class ProviderDashboardService implements IProviderDashboardService {
    
    private async getProvider(userId: string) {
        const provider = await ServiceProviderModel.findOne({ userId });
        if (!provider) {
            throw new AppError('Service Provider profile not found', HttpStatusCode.NOT_FOUND);
        }
        return provider;
    }

    async getOverview(userId: string): Promise<IDashboardOverview> {
        const provider = await this.getProvider(userId);
        const providerId = provider._id;

        const [wallet, assignmentStats, reviewStats] = await Promise.all([
            WalletModel.findOne({ providerId }),
            AssignmentModel.aggregate([
                { $match: { freelancerId: new mongoose.Types.ObjectId(String(providerId)) } },
                {
                    $group: {
                        _id: null,
                        activeJobs: {
                            $sum: {
                                $cond: [
                                    { $in: ['$workStatus', [WORK_STATUS.IN_PROGRESS, WORK_STATUS.ASSIGNED]] },
                                    1,
                                    0
                                ]
                            }
                        },
                        completedJobs: { $sum: { $cond: [{ $eq: ['$workStatus', WORK_STATUS.COMPLETED] }, 1, 0] } },
                        pendingAssignments: { $sum: { $cond: [{ $eq: ['$invite.status', ASSIGNMENT_STATUS.PENDING] }, 1, 0] } },
                        upcomingJobs: { $sum: { $cond: [{ $eq: ['$workStatus', WORK_STATUS.ASSIGNED] }, 1, 0] } },
                        totalAssignments: { $sum: 1 },
                        // Fallback earnings from assignment payment data
                        assignmentEarnings: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ['$workStatus', WORK_STATUS.COMPLETED] },
                                            { $eq: ['$payment.status', 'completed'] }
                                        ]
                                    },
                                    { $ifNull: ['$payment.amount', 0] },
                                    0
                                ]
                            }
                        }
                    }
                }
            ]),
            ReviewModel.aggregate([
                { $match: { revieweeId: new mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 }
                    }
                }
            ])
        ]);

        // Try WorkHistory first for earnings, fall back to assignment payment sums
        const workHistoryEarnings = await WorkHistoryModel.aggregate([
            { $match: { providerId: new mongoose.Types.ObjectId(String(providerId)), finalStatus: 'COMPLETED' } },
            { $group: { _id: null, total: { $sum: '$payment.providerAmount' } } }
        ]);

        const stats = assignmentStats[0] || { activeJobs: 0, completedJobs: 0, pendingAssignments: 0, upcomingJobs: 0, totalAssignments: 0, assignmentEarnings: 0 };
        const reviews = reviewStats[0] || { averageRating: 0, totalReviews: 0 };

        // Use WorkHistory earnings if available, otherwise fall back to assignment-level earnings
        const totalEarnings = (workHistoryEarnings[0]?.total || 0) > 0
            ? workHistoryEarnings[0].total
            : stats.assignmentEarnings;

        return {
            totalEarnings,
            walletBalance: wallet?.balance || 0,
            activeJobs: stats.activeJobs,
            completedJobs: stats.completedJobs,
            pendingAssignments: stats.pendingAssignments,
            averageRating: reviews.averageRating || 0,
            totalReviews: reviews.totalReviews,
            upcomingJobs: stats.upcomingJobs,
            totalAssignments: stats.totalAssignments
        };
    }

    async getActivity(userId: string): Promise<any> {
        const provider = await this.getProvider(userId);
        const providerId = provider._id;

        const [assignments, reviews, notifications] = await Promise.all([
            AssignmentModel.find({ freelancerId: providerId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('jobId', 'title description'),
            ReviewModel.find({ revieweeId: userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('reviewerId', 'name profileImage'),
            NotificationModel.find({ recipient: userId })
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        return {
            recentAssignments: assignments,
            recentReviews: reviews,
            recentNotifications: notifications
        };
    }

    async getCharts(userId: string): Promise<IChartData> {
        const provider = await this.getProvider(userId);
        const providerId = provider._id;
        const providerObjectId = new mongoose.Types.ObjectId(String(providerId));

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Try WorkHistory first for earnings chart
        let earningsData = await WorkHistoryModel.aggregate([
            { $match: { providerId: providerObjectId, finalStatus: 'COMPLETED', createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                    amount: { $sum: '$payment.providerAmount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Fallback: if no WorkHistory, derive earnings from completed assignments with payments
        if (!earningsData || earningsData.length === 0) {
            earningsData = await AssignmentModel.aggregate([
                {
                    $match: {
                        freelancerId: providerObjectId,
                        workStatus: WORK_STATUS.COMPLETED,
                        'payment.status': 'completed',
                        completedAt: { $gte: sixMonthsAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: { $ifNull: ['$completedAt', '$updatedAt'] } },
                            year: { $year: { $ifNull: ['$completedAt', '$updatedAt'] } }
                        },
                        amount: { $sum: { $ifNull: ['$payment.amount', 0] } }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);
        }

        const [statusData, activityData] = await Promise.all([
            AssignmentModel.aggregate([
                { $match: { freelancerId: providerObjectId } },
                { $group: { _id: '$workStatus', count: { $sum: 1 } } }
            ]),
            AssignmentModel.aggregate([
                { $match: { freelancerId: providerObjectId, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
                {
                    $group: {
                        _id: { $dayOfWeek: '$createdAt' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id': 1 } }
            ])
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Format status labels for readability
        const statusLabels: Record<string, string> = {
            [WORK_STATUS.ASSIGNED]: 'Assigned',
            [WORK_STATUS.IN_PROGRESS]: 'In Progress',
            [WORK_STATUS.COMPLETED]: 'Completed',
            [WORK_STATUS.CANCELLED]: 'Cancelled',
            [WORK_STATUS.ABSENT]: 'Absent'
        };

        return {
            monthlyEarnings: earningsData.map(d => ({ 
                month: months[d._id.month - 1], 
                amount: d.amount || 0
            })),
            jobStatusDistribution: statusData.map(d => ({ 
                status: statusLabels[d._id] || d._id || 'Unknown', 
                count: d.count || 0
            })),
            weeklyWorkActivity: activityData.map(d => ({ 
                day: days[d._id - 1] || 'Unknown', 
                count: d.count || 0
            }))
        };
    }

    async getPerformance(userId: string): Promise<IPerformanceStats> {
        const provider = await this.getProvider(userId);
        const providerId = provider._id;
        const providerObjectId = new mongoose.Types.ObjectId(String(providerId));

        const [assignmentStats, reviewStats] = await Promise.all([
            AssignmentModel.aggregate([
                { $match: { freelancerId: providerObjectId } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        completed: { $sum: { $cond: [{ $eq: ['$workStatus', WORK_STATUS.COMPLETED] }, 1, 0] } },
                        accepted: { $sum: { $cond: [{ $eq: ['$invite.status', ASSIGNMENT_STATUS.ACCEPTED] }, 1, 0] } },
                        rejected: { $sum: { $cond: [{ $eq: ['$invite.status', ASSIGNMENT_STATUS.REJECTED] }, 1, 0] } },
                        pending: { $sum: { $cond: [{ $eq: ['$invite.status', ASSIGNMENT_STATUS.PENDING] }, 1, 0] } }
                    }
                }
            ]),
            ReviewModel.aggregate([
                { $match: { revieweeId: new mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 }
                    }
                }
            ])
        ]);

        const stats = assignmentStats[0] || { total: 0, completed: 0, accepted: 0, rejected: 0, pending: 0 };
        const reviews = reviewStats[0] || { averageRating: 0, totalReviews: 0 };

        // Calculate rates - show 100% when no data (benefit of the doubt)
        const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 100;
        const totalInvites = stats.accepted + stats.rejected;
        const acceptanceRate = totalInvites > 0 ? (stats.accepted / totalInvites) * 100 : 100;

        return {
            completionRate: Math.round(completionRate),
            acceptanceRate: Math.round(acceptanceRate),
            averageRating: reviews.averageRating || 0,
            totalReviews: reviews.totalReviews
        };
    }

    async getAvailabilitySummary(userId: string): Promise<IAvailabilitySummary> {
        const provider = await this.getProvider(userId);
        
        const today = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[today.getDay()];
        
        const dayAvailability = provider.availability?.find(a => a.day === currentDay);
        
        const futureBlockedDates = (provider.blockedDates || [])
            .filter(d => new Date(d.startDate) >= today)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        return {
            availableToday: dayAvailability ? dayAvailability.isAvailable : false,
            nextBlockedDate: futureBlockedDates.length > 0 ? futureBlockedDates[0].startDate : null,
            weeklyAvailability: provider.availability || []
        };
    }
}


