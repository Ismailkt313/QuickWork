import { Request, Response, NextFunction } from 'express';
import { IReportService } from '../interfaces/report.interface';
import { CreateReportSchema, UpdateReportStatusSchema, mapReportToResponseDTO } from '../dtos/report.dto';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { AppError } from '../../../utils/AppError';
import { IReportController } from '../interfaces/report.interface';

export class ReportController implements IReportController {
    private _reportService: IReportService;

    constructor(reportService: IReportService) {
        this._reportService = reportService;
    }

    public createReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const validationResult = CreateReportSchema.safeParse(req.body);
            if (!validationResult.success) {
                const errorMessage = validationResult.error.issues.map(issue => issue.message).join(', ');
                throw new AppError(errorMessage, HttpStatusCode.BAD_REQUEST);
            }

            const reporterId = (req.user as any).userId;
            const report = await this._reportService.createReport(reporterId, validationResult.data);

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
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));

            const result = await this._reportService.getAllReports(page, limit);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Reports fetched successfully",
                data: result.reports.map(mapReportToResponseDTO),
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages
                }
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

            const updatedReport = await this._reportService.updateReportStatus(id as string, validationResult.data.status);

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
