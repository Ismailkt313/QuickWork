import { IReport, IReportRepository, IReportService, REPORT_STATUS } from '../interfaces/report.interface';
import { Types } from 'mongoose';
import { IAssignmentRepository } from '../../assignment/interfaces/assignment.interface';
import { AppError } from '../../../utils/AppError';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { CreateReportDTO } from '../dtos/report.dto';

export class ReportService implements IReportService {
    private _reportRepository: IReportRepository;
    private _assignmentRepository: IAssignmentRepository;

    constructor(reportRepository: IReportRepository, assignmentRepository: IAssignmentRepository) {
        this._reportRepository = reportRepository;
        this._assignmentRepository = assignmentRepository;
    }

    async createReport(reporterId: string, data: CreateReportDTO): Promise<IReport> {
        if (reporterId === data.reportedUserId) {
            throw new AppError("You cannot report yourself", HttpStatusCode.BAD_REQUEST);
        }

        const assignment = await this._assignmentRepository.findById(data.assignmentId);
        if (!assignment) {
            throw new AppError("Assignment not found", HttpStatusCode.NOT_FOUND);
        }

        return await this._reportRepository.create({
            ...data,
            assignmentId: new Types.ObjectId(data.assignmentId) as any,
            reportedUserId: new Types.ObjectId(data.reportedUserId) as any,
            reporterId: new Types.ObjectId(reporterId) as any,
            status: REPORT_STATUS.PENDING
        });
    }

    async getAllReports(page: number, limit: number): Promise<{
        reports: IReport[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const [reports, total] = await Promise.all([
            this._reportRepository.findAll(page, limit),
            this._reportRepository.getCount()
        ]);

        return {
            reports,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async updateReportStatus(id: string, status: REPORT_STATUS): Promise<IReport | null> {
        const report = await this._reportRepository.findById(id);
        if (!report) {
            throw new AppError("Report not found", HttpStatusCode.NOT_FOUND);
        }

        return await this._reportRepository.updateStatus(id, status);
    }
}
