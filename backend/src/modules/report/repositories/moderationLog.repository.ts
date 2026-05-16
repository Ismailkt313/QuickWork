import { ModerationLogModel, IModerationLog } from '../models/moderationLog.model';

export interface IModerationLogRepository {
    create(data: Partial<IModerationLog>): Promise<IModerationLog>;
    findByReportId(reportId: string): Promise<IModerationLog[]>;
}

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
