import { IUser } from "../../auth/interfaces/auth.interface";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { ROLES } from "../../../constants/roles";
import { VERIFICATION_STATUS } from "../../../constants/verification";




export interface IUserListQuery {
    page: number;
    limit: number;
    search?: string;
}

export interface IUserListItem {
    id: string;
    name: string;
    email: string;
    role: ROLES;
    isBlocked: boolean;
    createdAt: Date;
}

export interface IUserListResponse {
    success: boolean;
    message: string;
    data: {
        users: IUserListItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface IServiceProviderWithUser {
  _id: Types.ObjectId
  userId: {
    _id: Types.ObjectId
    name: string
    email: string
  }
  verification: {
    status: VERIFICATION_STATUS
  }
  createdAt: Date
}

export interface IAdminRepository {
    getUsers(query: IUserListQuery): Promise<IUser[]>;
    getUserCount(search?: string): Promise<number>;
    toggleBlockUser(userId: string): Promise<IUser>;
    getPendingProviders():Promise<IServiceProviderWithUser[]>;
    approveProvider(providerId: string): Promise<void>;
    rejectProvider(providerId: string, reason: string): Promise<void>;
    getProviderDetails(providerId: string): Promise<any>;
    getUserById(userId: string): Promise<IUser | null>;
}

export interface IAdminService {
    getUsers(query: IUserListQuery): Promise<IUserListResponse>;
    toggleBlockUser(userId: string): Promise<{ success: boolean; message: string; data: { isBlocked: boolean } }>;
    getPendingProviders(): Promise<IUserListResponse>;
    approveProvider(providerId: string): Promise<{ success: boolean; message: string }>;
    rejectProvider(providerId: string, reason: string): Promise<{ success: boolean; message: string }>;
    getProviderDetails(providerId: string): Promise<{ success: boolean; data: IServiceProviderDetails }>;
    getUserById(userId: string): Promise<{ success: boolean; data: IUser }>;
}

export interface IAdminController {
    getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    toggleBlockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPendingProviders(req: Request, res: Response, next: NextFunction): Promise<void>;
    approveProvider(req: Request, res: Response, next: NextFunction): Promise<void>;
    rejectProvider(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProviderDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserById(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface IServiceProviderDetails {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        phone: string;
    };
    headline: string;
    about: string;
    profileImage: string;
    skills: { _id: string; name: string }[];
    yearsOfExperience: number;
    hourlyRate: number;
    location: { _id: string; name: string };
    verification: {
        status: VERIFICATION_STATUS;
        verifiedAt?: Date;
        rejectionReason?: string;
    };
    isActive: boolean;
    submittedAt: Date;
    createdAt: Date;
}
