import { Document, Types } from 'mongoose';
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
}

export interface IAssignmentRepository {
    create(data: Partial<IAssignment>): Promise<IAssignment>;
    findById(id: string): Promise<IAssignment | null>;
    findOne(query: any): Promise<IAssignment | null>;
    find(query: any, options?: { page?: number, limit?: number, sort?: any }): Promise<IAssignment[]>;
    update(id: string, data: Partial<IAssignment>): Promise<IAssignment | null>;
    updateByJobId(jobId: string, data: Partial<IAssignment>): Promise<any>;
    exists(query: any): Promise<boolean>;
    count(query: any): Promise<number>;
    findWithFreelancer(jobId: string): Promise<IAssignment[]>;
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
    getProviderAssignments(req: any, res: any, next: any): Promise<void>;
    getAssignmentById(req: any, res: any, next: any): Promise<void>;
    updateStatus(req: any, res: any, next: any): Promise<void>;
    submitProof(req: any, res: any, next: any): Promise<void>;
    cancelByProvider(req: any, res: any, next: any): Promise<void>;
    cancelByClient(req: any, res: any, next: any): Promise<void>;
    reportAbsence(req: any, res: any, next: any): Promise<void>;
    markAsPaidByCash(req: any, res: any, next: any): Promise<void>;
    confirmPayment(req: any, res: any, next: any): Promise<void>;
    providerMarkAsPaid(req: any, res: any, next: any): Promise<void>;
    rejectPayment(req: any, res: any, next: any): Promise<void>;
}

