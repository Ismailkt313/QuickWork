import { Document, Types } from 'mongoose';
import { ASSIGNMENT_STATUS, WORK_STATUS, ASSIGNMENT_TYPE } from '../../../constants/assignment';

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
    createdAt: Date;
    updatedAt: Date;
}

export interface IAssignmentRepository {
    create(data: Partial<IAssignment>): Promise<IAssignment>;
    findById(id: string): Promise<IAssignment | null>;
    findOne(query: any): Promise<IAssignment | null>;
    find(query: any): Promise<IAssignment[]>;
    update(id: string, data: Partial<IAssignment>): Promise<IAssignment | null>;
    updateByJobId(jobId: string, data: Partial<IAssignment>): Promise<any>;
    exists(query: any): Promise<boolean>;
    count(query: any): Promise<number>;
}

export interface IAssignmentService {
    checkOverlap(freelancerId: string, startDate: Date, endDate: Date): Promise<boolean>;
    createAssignment(data: Partial<IAssignment>): Promise<IAssignment>;
    getAssignmentsByProvider(providerId: string): Promise<IAssignment[]>;
    cancelAssignmentsByJob(jobId: string): Promise<void>;
    getAssignmentById(id: string): Promise<IAssignment | null>;
    getAssignmentsByJobId(jobId: string): Promise<IAssignment[]>;
    updateStatus(id: string, status: WORK_STATUS): Promise<IAssignment | null>;
    submitProof(id: string, proofData: { images: string[], description: string }): Promise<IAssignment | null>;
    getAssignmentCountByJob(jobId: string): Promise<number>;
}

export interface IAssignmentController {
    getProviderAssignments(req: any, res: any, next: any): Promise<void>;
    getAssignmentById(req: any, res: any, next: any): Promise<void>;
    updateStatus(req: any, res: any, next: any): Promise<void>;
    submitProof(req: any, res: any, next: any): Promise<void>;
}

