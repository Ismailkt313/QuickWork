import { Document, Types } from "mongoose";
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
    createRequest(userId: string, dto: CreateServiceRequestDTO): Promise<{ success: boolean; message: string; data?: any }>;
    getUserRequests(userId: string): Promise<{ success: boolean; data: IServiceRequest[] }>;
    getPendingRequests(page: number, limit: number): Promise<{
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

export interface IServiceRequestRepository {
    findPendingByName(name: string): Promise<IServiceRequest | null>;
    create(requestData: Partial<IServiceRequest>): Promise<IServiceRequest>;
    findByUser(userId: string): Promise<IServiceRequest[]>;
    findAllPending(page: number, limit: number): Promise<IServiceRequest[]>;
    getPendingCount(): Promise<number>;
    findById(id: string): Promise<IServiceRequest | null>;
    updateStatus(id: string, updateData: Partial<IServiceRequest>, session?: any): Promise<IServiceRequest | null>;
}

export interface IServiceRequestController {
    createRequest(req: any, res: any, next: any): Promise<void>;
    getUserRequests(req: any, res: any, next: any): Promise<void>;
    getPendingRequests(req: any, res: any, next: any): Promise<void>;
    approveRequest(req: any, res: any, next: any): Promise<void>;
    rejectRequest(req: any, res: any, next: any): Promise<void>;
}