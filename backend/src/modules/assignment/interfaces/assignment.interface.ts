import { Document, Types, FilterQuery, UpdateWriteOpResult, SortOrder } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { ASSIGNMENT_STATUS, WORK_STATUS, ASSIGNMENT_TYPE } from '../../../constants/assignment';
import { PAYMENT_STATUS, PAYMENT_METHOD } from '../../../constants/payment';

export interface IAssignment extends Document {
    jobId: Types.ObjectId;
    freelancerId: Types.ObjectId;
    type: ASSIGNMENT_TYPE;
    invite: {
        status: ASSIGNMENT_STATUS;
        invitedBy: Types.ObjectId;
        invitedAt: Date;
        respondedAt?: Date;
    };
    workStatus: WORK_STATUS;
    schedule: {
        startDate: Date;
        endDate: Date;
    };
    assignedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    isOutOfDistrict: boolean;
    proof: string[];
    proofDescription?: string;
    cancellation?: {
        cancelledBy: Types.ObjectId;
        cancelledAt: Date;
        reason: 'provider_requested' | 'client_requested';
        isLateCancel: boolean;
        notes?: string;
    };
    absence?: {
        reportedBy: Types.ObjectId;
        reportedAt: Date;
        notes?: string;
        evidence?: string[];
    };
    payment?: {
        status: PAYMENT_STATUS;
        method?: PAYMENT_METHOD;
        amount: number;
        paidAt?: Date;
        transactionId?: string;
    };
    createdAt: Date;
    updatedAt: Date;
    assignmentCode: string;
}

export interface IAssignmentRepository {
    create(data: Partial<IAssignment>): Promise<IAssignment>;
    findById(id: string): Promise<IAssignment | null>;
    findOne(query: FilterQuery<IAssignment>): Promise<IAssignment | null>;
    find(query: FilterQuery<IAssignment>, options?: { page?: number, limit?: number, sort?: string | { [key: string]: SortOrder } }): Promise<IAssignment[]>;
    update(id: string, data: Partial<IAssignment>): Promise<IAssignment | null>;
    updateByJobId(jobId: string, data: Partial<IAssignment>): Promise<UpdateWriteOpResult>;
    exists(query: FilterQuery<IAssignment>): Promise<boolean>;
    count(query: FilterQuery<IAssignment>): Promise<number>;
    findWithFreelancer(jobId: string): Promise<IAssignment[]>;
    getDashboardStats(providerId: string): Promise<{
        activeJobs: number;
        completedJobs: number;
        pendingAssignments: number;
        upcomingJobs: number;
        totalAssignments: number;
        assignmentEarnings: number;
    }>;
    findRecentAssignments(providerId: string, limit: number): Promise<IAssignment[]>;
    getStatusDistribution(providerId: string): Promise<{ _id: string; count: number }[]>;
    getWeeklyActivity(providerId: string): Promise<{ _id: number; count: number }[]>;
    getPerformanceStats(providerId: string): Promise<{
        total: number;
        completed: number;
        accepted: number;
        rejected: number;
        pending: number;
    }>;
}

export interface IAssignmentService {
    checkOverlap(freelancerId: string, startDate: Date, endDate: Date): Promise<boolean>;
    createAssignment(data: Partial<IAssignment>): Promise<IAssignment>;
    getAssignmentsByProvider(providerId: string, options?: { page?: number, limit?: number, search?: string, status?: string }): Promise<{ assignments: IAssignment[], total: number, counts: { active: number, completed: number, cancelled: number, all: number } }>;
    cancelAssignmentsByJob(jobId: string): Promise<void>;
    getAssignmentById(id: string): Promise<IAssignment | null>;
    getAssignmentsByJobId(jobId: string): Promise<IAssignment[]>;
    updateStatus(id: string, status: WORK_STATUS): Promise<IAssignment | null>;
    submitProof(id: string, proofData: { images: string[], description: string }): Promise<IAssignment | null>;
    getAssignmentCountByJob(jobId: string): Promise<number>;
    cancelByProvider(id: string, providerId: string, notes?: string): Promise<IAssignment>;
    cancelByClient(id: string, clientId: string, notes?: string): Promise<IAssignment>;
    reportAbsence(id: string, clientId: string, notes?: string, evidence?: string[]): Promise<IAssignment>;
    markAsPaidByCash(id: string, clientId: string): Promise<IAssignment>;
    confirmPayment(id: string, providerId: string): Promise<IAssignment>;
    providerMarkAsPaid(id: string, providerId: string): Promise<IAssignment>;
    rejectPayment(id: string, providerId: string): Promise<IAssignment>;
    getAssignmentByJobAndFreelancer(jobId: string, freelancerId: string): Promise<IAssignment | null>;
}

export interface IAssignmentController {
    getProviderAssignments(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAssignmentById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    submitProof(req: Request, res: Response, next: NextFunction): Promise<void>;
    cancelByProvider(req: Request, res: Response, next: NextFunction): Promise<void>;
    cancelByClient(req: Request, res: Response, next: NextFunction): Promise<void>;
    reportAbsence(req: Request, res: Response, next: NextFunction): Promise<void>;
    markAsPaidByCash(req: Request, res: Response, next: NextFunction): Promise<void>;
    confirmPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    providerMarkAsPaid(req: Request, res: Response, next: NextFunction): Promise<void>;
    rejectPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
}

