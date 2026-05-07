import { ModerationLogModel } from '../models/moderationLog.model';

export interface IModerationLogRepository {
    create(data: any): Promise<any>;
    findByReportId(reportId: string): Promise<any[]>;
}

export class ModerationLogRepository implements IModerationLogRepository {
    async create(data: any): Promise<any> {
        return await ModerationLogModel.create(data);
    }

    async findByReportId(reportId: string): Promise<any[]> {
        return await ModerationLogModel.find({ reportId })
            .populate('adminId', 'name email')
            .sort({ createdAt: -1 });
    }
}
