import { IReportRepository } from '../interfaces/report.interface';
import { IModerationLogRepository } from '../repositories/moderationLog.repository';
import { IAuthRepository } from '../../auth/interfaces/auth.interface';
import { INotificationService } from '../../notification/interfaces/notification.interface';
import { REPORT_STATUS } from '../interfaces/report.interface';
import { AppError } from '../../../utils/AppError';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { IModerationService } from '../interfaces/report.interface';

export class ModerationService implements IModerationService {
    private reportRepository: IReportRepository;
    private notificationService: INotificationService;
    private moderationLogRepository: IModerationLogRepository;
    private authRepository: IAuthRepository;

    constructor(
        reportRepository: IReportRepository, 
        moderationLogRepository: IModerationLogRepository,
        authRepository: IAuthRepository,
        notificationService: INotificationService
    ) {
        this.reportRepository = reportRepository;
        this.moderationLogRepository = moderationLogRepository;
        this.authRepository = authRepository;
        this.notificationService = notificationService;
    }

    async getReports(query: { status?: string; page?: number; limit?: number }) {
        return await this.reportRepository.findWithFilters(query);
    }

    async getReportDetail(reportId: string) {
        const report = await this.reportRepository.findById(reportId);
        if (!report) {
            throw new AppError('Report not found', HttpStatusCode.NOT_FOUND);
        }

        const moderationLogs = await this.moderationLogRepository.findByReportId(reportId);

        return { report, moderationLogs };
    }

    async takeAction(
        reportId: string,
        adminId: string,
        action: 'warn' | 'block' | 'reject',
        reason: string
    ) {
        const report = await this.reportRepository.findById(reportId);
        if (!report) {
            throw new AppError('Report not found', HttpStatusCode.NOT_FOUND);
        }

        if (report.status === REPORT_STATUS.ACTION_TAKEN || report.status === REPORT_STATUS.REJECTED) {
            throw new AppError('This report has already been processed', HttpStatusCode.BAD_REQUEST);
        }

        const reportedUserId = report.reportedUserId._id.toString();

        if (action === 'warn') {
            await this.authRepository.incrementWarningCount(reportedUserId);

            await this.reportRepository.updateStatus(reportId, REPORT_STATUS.ACTION_TAKEN);

            await this.moderationLogRepository.create({
                userId: reportedUserId,
                reportId,
                action: 'warn',
                reason,
                adminId
            });

            await this.notificationService.createNotification({
                recipient: reportedUserId,
                title: 'Warning Received',
                message: `You have received a warning: ${reason}`,
                type: 'SYSTEM'
            });

        } else if (action === 'block') {
            await this.authRepository.blockUser(reportedUserId);

            await this.reportRepository.updateStatus(reportId, REPORT_STATUS.ACTION_TAKEN);

            await this.moderationLogRepository.create({
                userId: reportedUserId,
                reportId,
                action: 'block',
                reason,
                adminId
            });

            await this.notificationService.createNotification({
                recipient: reportedUserId,
                title: 'Account Blocked',
                message: `Your account has been blocked: ${reason}`,
                type: 'SYSTEM'
            });

        } else if (action === 'reject') {
            await this.reportRepository.updateStatus(reportId, REPORT_STATUS.REJECTED);

            await this.moderationLogRepository.create({
                userId: reportedUserId,
                reportId,
                action: 'reject',
                reason,
                adminId
            });
        }

        return await this.getReportDetail(reportId);
    }
}
