import { Request, Response, NextFunction } from "express";
import { Document, Types, ClientSession } from "mongoose";
import { CreateServiceRequestDTO } from '../dtos/createServiceRequest.dto';
import { RejectServiceRequestDTO } from "../dtos/rejectServiceRequest.dto";
import { SKILL_STATUS } from "../../../constants/skill";

export interface IServiceRequest extends Document {
    name: string;
    slug: string;
    description: string;
    requestedBy: Types.ObjectId;
    status: SKILL_STATUS;
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
    rejectionReason?: string;
    adminNotes?: string;
    createdAt: Date;
}

export interface IServiceRequestService {
    createRequest(userId: string, dto: CreateServiceRequestDTO): Promise<{ success: boolean; message: string; data?: IServiceRequest }>;
    getUserRequests(userId: string): Promise<{ success: boolean; data: IServiceRequest[] }>;
    getPendingRequests(page: number, limit: number, search?: string): Promise<{
        success: boolean;
        data: IServiceRequest[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    approveRequest(adminId: string, requestId: string): Promise<{ success: boolean; message: string }>;
    rejectRequest(adminId: string, requestId: string, dto: RejectServiceRequestDTO): Promise<{ success: boolean; message: string }>;
}

import { IBaseRepository } from '../../../shared/interfaces/base.repository.interface';

export interface IServiceRequestRepository extends IBaseRepository<IServiceRequest> {
    findPendingByName(name: string): Promise<IServiceRequest | null>;
    findByUser(userId: string): Promise<IServiceRequest[]>;
    findAllPending(page: number, limit: number, search?: string): Promise<IServiceRequest[]>;
    getPendingCount(search?: string): Promise<number>;
    updateStatus(id: string, updateData: Partial<IServiceRequest>, session?: ClientSession): Promise<IServiceRequest | null>;
}

export interface IServiceRequestController {
    createRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserRequests(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPendingRequests(req: Request, res: Response, next: NextFunction): Promise<void>;
    approveRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
    rejectRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
}