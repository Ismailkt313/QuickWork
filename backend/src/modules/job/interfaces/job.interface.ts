import { Document, Types } from 'mongoose';
import { CreateJobDTO } from '../dtos/createJob.dto';
import { JobResponseDTO } from '../dtos/jobResponse.dto';
import { JOB_STATUS } from '../../../constants/jobStatus';
import { JOB_VISIBILITY } from '../../../constants/jobVisibility';
import { JOB_DURATION_TYPE } from '../../../constants/jobDuration';

export interface IJob extends Document {
    title: string;
    description: string;
    contactNumber: string;
    skillId: Types.ObjectId;
    location: {
        district: Types.ObjectId;
        address: string;
        additionalDetails?: string;
        coordinates: {
            type: "Point";
            coordinates: [number, number];
        };
    };
    budget: {
        min: number;
        max: number;
    };

    applicantsCount: number;
    isUrgent: boolean;

    durationType: JOB_DURATION_TYPE;
    schedule: {
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
    };
    days?: number;
    freelancersNeeded: number;
    acceptedFreelancers: number;
    userId: Types.ObjectId;
    visibility: JOB_VISIBILITY;
    hiredProviderId?: Types.ObjectId;
    status: JOB_STATUS;
    createdAt: Date;
    updatedAt: Date;
    jobCode: string;
    cancelledByAdmin?: boolean;
    adminCancellationReason?: string;
    cancelledBy?: Types.ObjectId;
    cancelledAt?: Date;
}

export interface IJobPaginationResponse {
    success: boolean;
    data: JobResponseDTO[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    stats?: {
        total: number;
        active: number;
        disputed: number;
        flagged: number;
        stalled: number;
    };
    counts?: {
        all: number;
        direct: number;
        pending: number;
        ongoing: number;
        completed: number;
        cancelled: number;
    };
}

export interface IJobService {
    createJob(userId: string, dto: CreateJobDTO): Promise<{ success: boolean; message: string; data?: JobResponseDTO }>;
    getJobsByUser(
        userId: string,
        page: number,
        limit: number,
        filters?: { status?: string; search?: string; visibility?: string }
    ): Promise<IJobPaginationResponse>;
    
    availableJobs(page: number, limit: number, filters?: any, userId?: string): Promise<IJobPaginationResponse>;
    getJobById(id: string, userId?: string): Promise<{ success: boolean; data?: JobResponseDTO; message?: string }>;
    getDirectOffers(userId: string, page?: number, limit?: number, search?: string, filter?: string): Promise<IJobPaginationResponse>;
    acceptOffer(jobId: string, userId: string, amount?: number): Promise<{ success: boolean; message: string }>;
    rejectOffer(jobId: string, userId: string, reason?: string): Promise<{ success: boolean; message: string }>;
    acceptJob(jobId: string, userId: string, amount?: number): Promise<{ success: boolean; message: string }>;
    cancelJob(jobId: string, userId: string): Promise<{ success: boolean; message: string }>;
    getAllJobsAdmin(
        page: number,
        limit: number,
        filters?: {
            status?: string;
            search?: string;
            visibility?: string;
            isUrgent?: boolean;
            durationType?: string;
            skillId?: string;
            minBudget?: number;
            maxBudget?: number;
            type?: 'disputed' | 'flagged' | 'stalled' | 'payments';
        }
    ): Promise<IJobPaginationResponse>;
    adminGetJobDetails(jobId: string): Promise<{ success: boolean; data?: JobResponseDTO; message?: string }>;
    adminCancelJob(jobId: string, reason: string, adminId: string): Promise<{ success: boolean; message: string }>;
}

export interface IJobRepository {
    create(jobData: Partial<IJob>): Promise<IJob>;
    findByUser(userId: string): Promise<IJob[]>;
    findByUserPaginated(
        userId: string,
        page: number,
        limit: number,
        filters?: { status?: string; search?: string; visibility?: string }
    ): Promise<{ jobs: IJob[]; total: number }>;
    countByUserGrouped(userId: string): Promise<{
        all: number;
        direct: number;
        pending: number;
        ongoing: number;
        completed: number;
        cancelled: number;
    }>;
    findAllOpen(page: number, limit: number, filters: any , skill: string[], excludeJobIds?: string[], currentUserId?: string): Promise<{ jobs: IJob[], total: number }>;
    findAllPaginated(
        page: number,
        limit: number,
        filters?: { 
            status?: string; 
            search?: string; 
            visibility?: string;
            isUrgent?: boolean;
            durationType?: string;
            skillId?: string;
            minBudget?: number;
            maxBudget?: number;
        }
    ): Promise<{ jobs: IJob[]; total: number }>;
    findById(id: string): Promise<IJob | null>;
    findByProvider(providerId: string): Promise<IJob[]>;
    findByProviderPaginated(
        providerId: string,
        page: number,
        limit: number,
        search?: string,
        filter?: string
    ): Promise<{ jobs: IJob[]; total: number }>;
    countByProviderGrouped(providerId: string): Promise<{
        all: number;
        pending: number;
        accepted: number;
        rejected: number;
    }>;
    updateStatus(id: string, status: JOB_STATUS): Promise<IJob | null>;
    findByConditionAndUpdate(query: any, update: any): Promise<IJob | null>;
    find(query: any): Promise<IJob[]>;
    count(query: any): Promise<number>;
}

export interface IJobController {
    createJob(req: any, res: any, next: any): Promise<void>;
    getUserJobs(req: any, res: any, next: any): Promise<void>;
    availableJobs(req: any, res: any, next: any): Promise<void>;
    getJobById(req: any, res: any, next: any): Promise<void>;
    getDirectOffers(req: any, res: any, next: any): Promise<void>;
    acceptOffer(req: any, res: any, next: any): Promise<void>;
    rejectOffer(req: any, res: any, next: any): Promise<void>;
    acceptJob(req: any, res: any, next: any): Promise<void>;
    cancelJob(req: any, res: any, next: any): Promise<void>;
    getJobAssignments(req: any, res: any, next: any): Promise<void>;
    getAllJobsAdmin(req: any, res: any, next: any): Promise<void>;
    getJobDetailsAdmin(req: any, res: any, next: any): Promise<void>;
    adminCancelJob(req: any, res: any, next: any): Promise<void>;
}
