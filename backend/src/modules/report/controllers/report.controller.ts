import { Request, Response, NextFunction } from 'express';
import { IReportService, REPORT_STATUS } from '../interfaces/report.interface';
import { CreateReportSchema, UpdateReportStatusSchema, mapReportToResponseDTO } from '../dtos/report.dto';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { AppError } from '../../../utils/AppError';

export class ReportController {
    private reportService: IReportService;

    constructor(reportService: IReportService) {
        this.reportService = reportService;
    }

    public createReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const validationResult = CreateReportSchema.safeParse(req.body);
            if (!validationResult.success) {
                const errorMessage = validationResult.error.issues.map(issue => issue.message).join(', ');
                throw new AppError(errorMessage, HttpStatusCode.BAD_REQUEST);
            }

            const reporterId = (req.user as any).userId;
            const report = await this.reportService.createReport(reporterId, validationResult.data);

            res.status(HttpStatusCode.CREATED).json({
                success: true,
                message: "Report submitted successfully",
                data: report
            });
        } catch (error) {
            next(error);
        }
    };

    public getAllReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const reports = await this.reportService.getAllReports();
            
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Reports fetched successfully",
                data: reports.map(mapReportToResponseDTO)
            });
        } catch (error) {
            next(error);
        }
    };

    public updateReportStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const validationResult = UpdateReportStatusSchema.safeParse(req.body);
            if (!validationResult.success) {
                const errorMessage = validationResult.error.issues.map(issue => issue.message).join(', ');
                throw new AppError(errorMessage, HttpStatusCode.BAD_REQUEST);
            }

            const updatedReport = await this.reportService.updateReportStatus(id as string, validationResult.data.status);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Report status updated successfully",
                data: updatedReport ? mapReportToResponseDTO(updatedReport) : null
            });
        } catch (error) {
            next(error);
        }
    };
}
