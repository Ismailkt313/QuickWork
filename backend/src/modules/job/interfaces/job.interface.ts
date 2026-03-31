import { Document, Types } from 'mongoose';
import { CreateJobDTO } from '../dtos/createJob.dto';
import { JobResponseDTO } from '../dtos/jobResponse.dto';

export interface IJob extends Document {
    title: string;
    description: string;
    skillId: Types.ObjectId;
    locationId: Types.ObjectId;
    budget: {
        min: number;
        max: number;
    };
    jobType: 'fixed' | 'hourly';
    applicantsCount: number;
    isUrgent: boolean;

    durationType: string;
    schedule: {
        startDate: Date;
        endDate: Date;
    };
    days?: number;
    freelancersNeeded: number;
    userId: Types.ObjectId;
    status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
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
    availableJobs(page: number, limit: number, filters?: any): Promise<IJobPaginationResponse>;
    getJobById(id: string): Promise<{ success: boolean; data?: JobResponseDTO; message?: string }>;
}

export interface IJobRepository {
    create(jobData: Partial<IJob>): Promise<IJob>;
    findByUser(userId: string): Promise<IJob[]>;
    findAllOpen(page: number, limit: number, filters: any): Promise<{ jobs: IJob[], total: number }>;
    findById(id: string): Promise<IJob | null>;
    updateStatus(id: string, status: string): Promise<IJob | null>;
}

export interface IJobController {
    createJob(req: any, res: any, next: any): Promise<void>;
    getUserJobs(req: any, res: any, next: any): Promise<void>;
    availableJobs(req: any, res: any, next: any): Promise<void>;
    getJobById(req: any, res: any, next: any): Promise<void>;
}
