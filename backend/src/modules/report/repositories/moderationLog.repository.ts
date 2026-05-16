import { ModerationLogModel } from '../models/moderationLog.model';
import { IModerationLog, IModerationLogRepository } from '../interfaces/report.interface';

export class ModerationLogRepository implements IModerationLogRepository {
    async create(data: Partial<IModerationLog>): Promise<IModerationLog> {
        return await ModerationLogModel.create(data);
    }

    async findByReportId(reportId: string): Promise<IModerationLog[]> {
        return await ModerationLogModel.find({ reportId })
            .populate('adminId', 'name email')
            .sort({ createdAt: -1 });
    }
}

