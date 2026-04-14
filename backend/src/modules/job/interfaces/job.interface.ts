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
}

export interface IJobPaginationResponse {
    success: boolean;
    data: JobResponseDTO[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface IJobService {
    createJob(userId: string, dto: CreateJobDTO): Promise<{ success: boolean; message: string; data?: JobResponseDTO }>;
    getJobsByUser(userId: string): Promise<{ success: boolean; data: JobResponseDTO[] }>;
    availableJobs(page: number, limit: number, filters?: any, userId?: string): Promise<IJobPaginationResponse>;
    getJobById(id: string, userId?: string): Promise<{ success: boolean; data?: JobResponseDTO; message?: string }>;
    getDirectOffers(userId: string): Promise<{ success: boolean; data: JobResponseDTO[] }>;
    acceptOffer(jobId: string, userId: string): Promise<{ success: boolean; message: string }>;
    rejectOffer(jobId: string, userId: string, reason?: string): Promise<{ success: boolean; message: string }>;
    acceptJob(jobId: string, userId: string): Promise<{ success: boolean; message: string }>;
    cancelJob(jobId: string, userId: string): Promise<{ success: boolean; message: string }>;
}

export interface IJobRepository {
    create(jobData: Partial<IJob>): Promise<IJob>;
    findByUser(userId: string): Promise<IJob[]>;
    findAllOpen(page: number, limit: number, filters: any , skill:string[]): Promise<{ jobs: IJob[], total: number }>;
    findById(id: string): Promise<IJob | null>;
    findByProvider(providerId: string): Promise<IJob[]>;
    updateStatus(id: string, status: JOB_STATUS): Promise<IJob | null>;
    findByConditionAndUpdate(query: any, update: any): Promise<IJob | null>;
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
}
