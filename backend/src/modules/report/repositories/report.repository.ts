import { IReport, IReportRepository, REPORT_STATUS } from '../interfaces/report.interface';
import { ReportModel } from '../models/report.model';
import { UserModel } from '../../auth/models/user.model';

export class ReportRepository implements IReportRepository {
    async create(data: Partial<IReport>): Promise<IReport> {
        const report = new ReportModel(data);
        return await report.save();
    }

    async findAll(page: number, limit: number): Promise<IReport[]> {
        const skip = (page - 1) * limit;
        return await ReportModel.find()
            .populate('reporterId', 'name email profileImage')
            .populate('reportedUserId', 'name email profileImage isBlocked warningCount')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async getCount(): Promise<number> {
        return await ReportModel.countDocuments();
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
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{ reports: IReport[]; total: number; page: number; pages: number }> {
        const { status, search, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const filter: Record<string, unknown> = {};
        
        if (status && status !== 'all') {
            filter.status = status;
        }

        if (search && search.trim() !== '') {
            const regex = new RegExp(search.trim(), 'i');
            const matchingUsers = await UserModel.find(
                { $or: [{ name: { $regex: regex } }, { email: { $regex: regex } }] },
                '_id'
            ).lean();
            
            const userIds = matchingUsers.map(u => u._id);

            filter.$or = [
                { reason: { $regex: regex } },
                { reporterId: { $in: userIds } },
                { reportedUserId: { $in: userIds } }
            ];
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

    async countPendingReports(): Promise<number> {
        return ReportModel.countDocuments({ status: 'PENDING' });
    }

    async getRecentReports(limit: number): Promise<IReport[]> {
        return ReportModel.find()
            .populate('reporterId', 'name email profileImage')
            .sort({ createdAt: -1 })
            .limit(limit);
    }
}
