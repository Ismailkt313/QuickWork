import { Document, Types } from 'mongoose';

export enum REPORT_STATUS {
    PENDING = 'pending',
    REVIEWED = 'reviewed',
    RESOLVED = 'resolved'
}

export interface IReport extends Document {
    assignmentId: Types.ObjectId;
    reporterId: Types.ObjectId;
    reportedUserId: Types.ObjectId;
    reason: string;
    description?: string;
    status: REPORT_STATUS;
    createdAt: Date;
    updatedAt: Date;
}

export interface IReportRepository {
    create(data: Partial<IReport>): Promise<IReport>;
    findAll(): Promise<IReport[]>;
    findById(id: string): Promise<IReport | null>;
    updateStatus(id: string, status: REPORT_STATUS): Promise<IReport | null>;
}

export interface IReportService {
    createReport(reporterId: string, data: any): Promise<IReport>;
    getAllReports(): Promise<IReport[]>;
    updateReportStatus(id: string, status: REPORT_STATUS): Promise<IReport | null>;
}
