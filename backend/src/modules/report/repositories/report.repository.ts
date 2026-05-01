import { IReport, IReportRepository, REPORT_STATUS } from '../interfaces/report.interface';
import { ReportModel } from '../models/report.model';

export class ReportRepository implements IReportRepository {
    async create(data: Partial<IReport>): Promise<IReport> {
        const report = new ReportModel(data);
        return await report.save();
    }

    async findAll(): Promise<IReport[]> {
        return await ReportModel.find()
            .populate('reporterId', 'name email profileImage')
            .populate('reportedUserId', 'name email profileImage isBlocked warningCount')
            .sort({ createdAt: -1 });
    }

    async findById(id: string): Promise<IReport | null> {
        return await ReportModel.findById(id)
            .populate('reporterId', 'name email profileImage')
            .populate('reportedUserId', 'name email profileImage isBlocked warningCount');
    }

    async updateStatus(id: string, status: REPORT_STATUS): Promise<IReport | null> {
        return await ReportModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('reporterId', 'name email profileImage')
         .populate('reportedUserId', 'name email profileImage isBlocked warningCount');
    }

    async findWithFilters(query: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ reports: IReport[]; total: number; page: number; pages: number }> {
        const { status, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (status && status !== 'all') {
            filter.status = status;
        }

        const [reports, total] = await Promise.all([
            ReportModel.find(filter)
                .populate('reporterId', 'name email profileImage')
                .populate('reportedUserId', 'name email profileImage isBlocked warningCount')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ReportModel.countDocuments(filter)
        ]);

        return {
            reports,
            total,
            page,
            pages: Math.ceil(total / limit)
        };
    }
}
