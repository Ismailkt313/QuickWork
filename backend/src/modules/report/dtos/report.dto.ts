import { z } from 'zod';
import { REPORT_STATUS, REPORT_ROLE, IReport } from '../interfaces/report.interface';

export const CreateReportSchema = z.object({
    assignmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid assignmentId"),
    reportedUserId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid reportedUserId"),
    role: z.nativeEnum(REPORT_ROLE),
    reason: z.string().min(1, "Reason is required"),
    description: z.string().optional(),
    images: z.array(z.string()).optional()
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
    role: REPORT_ROLE;
    reason: string;
    description?: string;
    images?: string[];
    status: REPORT_STATUS;
    createdAt: Date;
}

export const mapReportToResponseDTO = (report: IReport | Record<string, unknown>): ReportResponseDTO => {
    const r = report as unknown as Record<string, unknown>;
    const repId = r.reporterId as Record<string, unknown> | undefined;
    const reportedUser = r.reportedUserId as Record<string, unknown> | undefined;

    return {
        id: r._id ? (r._id as { toString(): string }).toString() : ((r.id as string) || ''),
        assignmentId: r.assignmentId ? (r.assignmentId as { toString(): string }).toString() : '',
        reporterId: {
            id: repId?._id ? (repId._id as { toString(): string }).toString() : (repId ? (repId as { toString(): string }).toString() : ''),
            name: (repId?.name as string) || 'User'
        },
        reportedUserId: {
            id: reportedUser?._id ? (reportedUser._id as { toString(): string }).toString() : (reportedUser ? (reportedUser as { toString(): string }).toString() : ''),
            name: (reportedUser?.name as string) || 'User'
        },
        role: r.role as REPORT_ROLE,
        reason: (r.reason as string) || '',
        description: r.description as string | undefined,
        images: (r.images as string[]) || [],
        status: r.status as REPORT_STATUS,
        createdAt: (r.createdAt as Date) || new Date()
    };
};

