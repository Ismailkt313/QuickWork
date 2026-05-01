import { Document, Types } from 'mongoose';

export enum REPORT_STATUS {
    PENDING = 'pending',
    REVIEWED = 'reviewed',
    RESOLVED = 'resolved',
    ACTION_TAKEN = 'action_taken',
    REJECTED = 'rejected'
}

export enum REPORT_ROLE {
    CLIENT_TO_PROVIDER = 'client_to_provider',
    PROVIDER_TO_CLIENT = 'provider_to_client'
}

export interface IReport extends Document {
    assignmentId: Types.ObjectId;
    reporterId: Types.ObjectId;
    reportedUserId: Types.ObjectId;
    role: REPORT_ROLE;
    reason: string;
    description?: string;
    images?: string[];
    status: REPORT_STATUS;
    createdAt: Date;
    updatedAt: Date;
}

export interface IReportRepository {
    create(data: Partial<IReport>): Promise<IReport>;
    findAll(): Promise<IReport[]>;
    findById(id: string): Promise<IReport | null>;
    updateStatus(id: string, status: REPORT_STATUS): Promise<IReport | null>;
    findWithFilters(query: { status?: string; page?: number; limit?: number }): Promise<{
        reports: IReport[];
        total: number;
        page: number;
        pages: number;
    }>;
}

export interface IReportService {
    createReport(reporterId: string, data: any): Promise<IReport>;
    getAllReports(): Promise<IReport[]>;
    updateReportStatus(id: string, status: REPORT_STATUS): Promise<IReport | null>;
}

import { Request, Response, NextFunction } from 'express';

export interface IReportController {
    createReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllReports(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateReportStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface IModerationController {
    getReports(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReportDetail(req: Request, res: Response, next: NextFunction): Promise<void>;
    takeAction(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface IModerationService {
    getReports(query: any): Promise<any>;
    getReportDetail(id: string): Promise<any>;
    takeAction(reportId: string, adminId: string, action: string, reason: string): Promise<any>;
}
