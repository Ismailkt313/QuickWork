import { z } from 'zod';
import { REPORT_STATUS } from '../interfaces/report.interface';

export const CreateReportSchema = z.object({
    assignmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid assignmentId"),
    reportedUserId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid reportedUserId"),
    reason: z.string().min(1, "Reason is required"),
    description: z.string().optional()
});

export type CreateReportDTO = z.infer<typeof CreateReportSchema>;

export const UpdateReportStatusSchema = z.object({
    status: z.nativeEnum(REPORT_STATUS)
});

export type UpdateReportStatusDTO = z.infer<typeof UpdateReportStatusSchema>;

export interface ReportResponseDTO {
    id: string;
    assignmentId: string;
    reporterId: {
        id: string;
        name: string;
    };
    reportedUserId: {
        id: string;
        name: string;
    };
    reason: string;
    description?: string;
    status: REPORT_STATUS;
    createdAt: Date;
}

export const mapReportToResponseDTO = (report: any): ReportResponseDTO => {
    return {
        id: report._id.toString(),
        assignmentId: report.assignmentId.toString(),
        reporterId: {
            id: report.reporterId._id.toString(),
            name: report.reporterId.name
        },
        reportedUserId: {
            id: report.reportedUserId._id.toString(),
            name: report.reportedUserId.name
        },
        reason: report.reason,
        description: report.description,
        status: report.status,
        createdAt: report.createdAt
    };
};
