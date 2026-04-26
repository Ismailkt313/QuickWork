import { IReport, IReportRepository, IReportService, REPORT_STATUS } from '../interfaces/report.interface';
import { Types } from 'mongoose';
import { AssignmentModel } from '../../assignment/models/assignment.model';
import { AppError } from '../../../utils/AppError';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { CreateReportDTO } from '../dtos/report.dto';

export class ReportService implements IReportService {
    private reportRepository: IReportRepository;

    constructor(reportRepository: IReportRepository) {
        this.reportRepository = reportRepository;
    }

    async createReport(reporterId: string, data: CreateReportDTO): Promise<IReport> {
        // 1. Prevent self-report
        if (reporterId === data.reportedUserId) {
            throw new AppError("You cannot report yourself", HttpStatusCode.BAD_REQUEST);
        }

        // 2. Validate assignment exists
        const assignment = await AssignmentModel.findById(data.assignmentId);
        if (!assignment) {
            throw new AppError("Assignment not found", HttpStatusCode.NOT_FOUND);
        }

        // 3. Create report
        return await this.reportRepository.create({
            ...data,
            assignmentId: new Types.ObjectId(data.assignmentId) as any,
            reportedUserId: new Types.ObjectId(data.reportedUserId) as any,
            reporterId: new Types.ObjectId(reporterId) as any,
            status: REPORT_STATUS.PENDING
        });
    }

    async getAllReports(): Promise<IReport[]> {
        return await this.reportRepository.findAll();
    }

    async updateReportStatus(id: string, status: REPORT_STATUS): Promise<IReport | null> {
        const report = await this.reportRepository.findById(id);
        if (!report) {
            throw new AppError("Report not found", HttpStatusCode.NOT_FOUND);
        }

        return await this.reportRepository.updateStatus(id, status);
    }
}
