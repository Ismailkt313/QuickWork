import { IReport, IReportRepository, REPORT_STATUS } from '../interfaces/report.interface';
import { ReportModel } from '../models/report.model';

export class ReportRepository implements IReportRepository {
    async create(data: Partial<IReport>): Promise<IReport> {
        const report = new ReportModel(data);
        return await report.save();
    }

    async findAll(): Promise<IReport[]> {
        return await ReportModel.find()
            .populate('reporterId', 'name')
            .populate('reportedUserId', 'name')
            .sort({ createdAt: -1 });
    }

    async findById(id: string): Promise<IReport | null> {
        return await ReportModel.findById(id)
            .populate('reporterId', 'name')
            .populate('reportedUserId', 'name');
    }

    async updateStatus(id: string, status: REPORT_STATUS): Promise<IReport | null> {
        return await ReportModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('reporterId', 'name').populate('reportedUserId', 'name');
    }
}
