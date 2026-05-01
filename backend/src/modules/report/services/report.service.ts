import { IReport, IReportRepository, IReportService, REPORT_STATUS } from '../interfaces/report.interface';
import { Types } from 'mongoose';
import { IAssignmentRepository } from '../../assignment/interfaces/assignment.interface';
import { AppError } from '../../../utils/AppError';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { CreateReportDTO } from '../dtos/report.dto';

export class ReportService implements IReportService {
    private reportRepository: IReportRepository;
    private assignmentRepository: IAssignmentRepository;

    constructor(reportRepository: IReportRepository, assignmentRepository: IAssignmentRepository) {
        this.reportRepository = reportRepository;
        this.assignmentRepository = assignmentRepository;
    }

    async createReport(reporterId: string, data: CreateReportDTO): Promise<IReport> {
        if (reporterId === data.reportedUserId) {
            throw new AppError("You cannot report yourself", HttpStatusCode.BAD_REQUEST);
        }

        const assignment = await this.assignmentRepository.findById(data.assignmentId);
        if (!assignment) {
            throw new AppError("Assignment not found", HttpStatusCode.NOT_FOUND);
        }

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
