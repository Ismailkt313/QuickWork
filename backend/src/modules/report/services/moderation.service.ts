import {
    IReportRepository,
    IModerationLogRepository,
    IModerationLog,
    REPORT_STATUS,
    IModerationService
} from '../interfaces/report.interface';
import { IAuthRepository } from '../../auth/interfaces/auth.interface';
import { INotificationService } from '../../notification/interfaces/notification.interface';
import { AppError } from '../../../utils/AppError';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { ILogger } from '../../../shared/interfaces/ILogger';

export class ModerationService implements IModerationService {
    private _reportRepository: IReportRepository;
    private _notificationService: INotificationService;
    private _moderationLogRepository: IModerationLogRepository;
    private _authRepository: IAuthRepository;
    private _logger: ILogger;

    constructor(
        reportRepository: IReportRepository,
        moderationLogRepository: IModerationLogRepository,
        authRepository: IAuthRepository,
        notificationService: INotificationService,
        logger: ILogger
    ) {
        this._reportRepository = reportRepository;
        this._moderationLogRepository = moderationLogRepository;
        this._authRepository = authRepository;
        this._notificationService = notificationService;
        this._logger = logger;
    }

    async getReports(query: { status?: string; search?: string; page?: number; limit?: number }) {
        return await this._reportRepository.findWithFilters(query);
    }

    async getReportDetail(reportId: string) {
        const report = await this._reportRepository.findById(reportId);
        if (!report) {
            throw new AppError('Report not found', HttpStatusCode.NOT_FOUND);
        }

        const moderationLogs = await this._moderationLogRepository.findByReportId(reportId);

        return { report, moderationLogs };
    }

    async takeAction(
        reportId: string,
        adminId: string,
        action: 'warn' | 'block' | 'reject',
        reason: string
    ) {
        const report = await this._reportRepository.findById(reportId);
        if (!report) {
            throw new AppError('Report not found', HttpStatusCode.NOT_FOUND);
        }

        if (report.status === REPORT_STATUS.ACTION_TAKEN || report.status === REPORT_STATUS.REJECTED) {
            throw new AppError('This report has already been processed', HttpStatusCode.BAD_REQUEST);
        }

        const reportedUserId = report.reportedUserId._id.toString();

        if (action === 'warn') {
            await this._authRepository.incrementWarningCount(reportedUserId);

            await this._reportRepository.updateStatus(reportId, REPORT_STATUS.ACTION_TAKEN);

            await this._moderationLogRepository.create({
                userId: reportedUserId,
                reportId,
                action: 'warn',
                reason,
                adminId
            } as unknown as Partial<IModerationLog>);

            await this._notificationService.createNotification({
                recipient: reportedUserId,
                title: 'Warning Received',
                message: `You have received a warning: ${reason}`,
                type: 'SYSTEM'
            });

            this._logger.info("Warning Issued", { userId: reportedUserId, adminId, reason, reportId });

        } else if (action === 'block') {
            await this._authRepository.blockUser(reportedUserId);

            await this._reportRepository.updateStatus(reportId, REPORT_STATUS.ACTION_TAKEN);

            await this._moderationLogRepository.create({
                userId: reportedUserId,
                reportId,
                action: 'block',
                reason,
                adminId
            } as unknown as Partial<IModerationLog>);

            await this._notificationService.createNotification({
                recipient: reportedUserId,
                title: 'Account Blocked',
                message: `Your account has been blocked: ${reason}`,
                type: 'SYSTEM'
            });

            this._logger.info("User Blocked", { userId: reportedUserId, adminId, reason, reportId });

        } else if (action === 'reject') {
            await this._reportRepository.updateStatus(reportId, REPORT_STATUS.REJECTED);

            await this._moderationLogRepository.create({
                userId: reportedUserId,
                reportId,
                action: 'reject',
                reason,
                adminId
            } as unknown as Partial<IModerationLog>);
        }

        return await this.getReportDetail(reportId);
    }
}

