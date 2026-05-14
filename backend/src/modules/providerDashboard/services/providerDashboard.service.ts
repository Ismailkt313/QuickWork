import { IProviderDashboardService, IDashboardOverview, IPerformanceStats, IChartData, IAvailabilitySummary } from '../interfaces/providerDashboard.interface';
import { IServiceProviderRepository } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { IAssignmentRepository } from '../../assignment/interfaces/assignment.interface';
import { IWorkHistoryRepository, IWalletRepository } from '../../finance/interfaces/finance.interface';
import { IReviewRepository } from '../../review/interfaces/review.interface';
import { INotificationRepository } from '../../notification/interfaces/notification.interface';
import { ASSIGNMENT_STATUS, WORK_STATUS } from '../../../constants/assignment';
import { AppError } from '../../../utils/AppError';
import { HttpStatusCode } from '../../../constants/httpStatusCode';

export class ProviderDashboardService implements IProviderDashboardService {
    constructor(
        private _providerRepo: IServiceProviderRepository,
        private _assignmentRepo: IAssignmentRepository,
        private _walletRepo: IWalletRepository,
        private _workHistoryRepo: IWorkHistoryRepository,
        private _reviewRepo: IReviewRepository,
        private _notificationRepo: INotificationRepository
    ) {}

    private async _getProviderId(userId: string) {
        const provider = await this._providerRepo.findByUserId(userId);
        if (!provider) {
            throw new AppError('Service Provider profile not found', HttpStatusCode.NOT_FOUND);
        }
        return provider._id;
    }

    async getOverview(userId: string): Promise<IDashboardOverview> {
        const providerId = await this._getProviderId(userId);

        const [wallet, assignmentStats, reviewStats, workHistoryEarnings] = await Promise.all([
            this._walletRepo.findByProviderId(String(providerId)),
            this._assignmentRepo.getDashboardStats(String(providerId)),
            this._reviewRepo.getDashboardStats(userId),
            this._workHistoryRepo.getEarningsStats(String(providerId))
        ]);

        const totalEarnings = (workHistoryEarnings?.total || 0) > 0
            ? workHistoryEarnings.total
            : assignmentStats.assignmentEarnings;

        return {
            totalEarnings,
            walletBalance: wallet?.balance || 0,
            activeJobs: assignmentStats.activeJobs,
            completedJobs: assignmentStats.completedJobs,
            pendingAssignments: assignmentStats.pendingAssignments,
            averageRating: reviewStats.averageRating || 0,
            totalReviews: reviewStats.totalReviews,
            upcomingJobs: assignmentStats.upcomingJobs,
            totalAssignments: assignmentStats.totalAssignments
        };
    }

    async getActivity(userId: string): Promise<any> {
        const providerId = await this._getProviderId(userId);

        const [assignments, reviews, notifications] = await Promise.all([
            this._assignmentRepo.findRecentAssignments(String(providerId), 5),
            this._reviewRepo.findRecentReviews(userId, 5),
            this._notificationRepo.findByUserId(userId, 10)
        ]);

        return {
            recentAssignments: assignments,
            recentReviews: reviews,
            recentNotifications: notifications
        };
    }

    async getCharts(userId: string): Promise<IChartData> {
        const providerId = await this._getProviderId(userId);

        const [earningsData, statusData, activityData] = await Promise.all([
            this._workHistoryRepo.getMonthlyEarnings(String(providerId), 6),
            this._assignmentRepo.getStatusDistribution(String(providerId)),
            this._assignmentRepo.getWeeklyActivity(String(providerId))
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const statusLabels: Record<string, string> = {
            [WORK_STATUS.ASSIGNED]: 'Assigned',
            [WORK_STATUS.IN_PROGRESS]: 'In Progress',
            [WORK_STATUS.COMPLETED]: 'Completed',
            [WORK_STATUS.CANCELLED]: 'Cancelled',
            [WORK_STATUS.ABSENT]: 'Absent'
        };

        return {
            monthlyEarnings: earningsData.map((d: any) => ({
                month: months[d._id.month - 1],
                amount: d.amount || 0
            })),
            jobStatusDistribution: statusData.map((d: any) => ({
                status: statusLabels[d._id] || d._id || 'Unknown',
                count: d.count || 0
            })),
            weeklyWorkActivity: activityData.map((d: any) => ({
                day: days[d._id - 1] || 'Unknown',
                count: d.count || 0
            }))
        };
    }

    async getPerformance(userId: string): Promise<IPerformanceStats> {
        const providerId = await this._getProviderId(userId);

        const [assignmentStats, reviewStats] = await Promise.all([
            this._assignmentRepo.getPerformanceStats(String(providerId)),
            this._reviewRepo.getDashboardStats(userId)
        ]);

        const completionRate = assignmentStats.total > 0 ? (assignmentStats.completed / assignmentStats.total) * 100 : 100;
        const totalInvites = assignmentStats.accepted + assignmentStats.rejected;
        const acceptanceRate = totalInvites > 0 ? (assignmentStats.accepted / totalInvites) * 100 : 100;

        return {
            completionRate: Math.round(completionRate),
            acceptanceRate: Math.round(acceptanceRate),
            averageRating: reviewStats.averageRating || 0,
            totalReviews: reviewStats.totalReviews
        };
    }

    async getAvailabilitySummary(userId: string): Promise<IAvailabilitySummary> {
        const provider = await this._providerRepo.findByUserId(userId);
        if (!provider) {
            throw new AppError('Service Provider profile not found', HttpStatusCode.NOT_FOUND);
        }

        const today = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[today.getDay()];

        const dayAvailability = provider.availability?.find((a: any) => a.day === currentDay);

        const futureBlockedDates = (provider.blockedDates || [])
            .filter((d: any) => new Date(d.startDate) >= today)
            .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        return {
            availableToday: dayAvailability ? dayAvailability.isAvailable : false,
            nextBlockedDate: futureBlockedDates.length > 0 ? futureBlockedDates[0].startDate : null,
            weeklyAvailability: provider.availability || []
        };
    }
}


