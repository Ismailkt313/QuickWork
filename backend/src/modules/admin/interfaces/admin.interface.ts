import { IUser } from "../../auth/interfaces/auth.interface";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { ROLES } from "../../../constants/roles";
import { VERIFICATION_STATUS } from "../../../constants/verification";
import { IApiResponse, IPaginatedResponse } from "../../../types/api.types";

export interface IUserListQuery {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    isBlocked?: boolean;
}

export interface IUserListItem {
    id: string;
    name: string;
    email: string;
    role: ROLES;
    isBlocked: boolean;
    createdAt: Date;
}

export type IUserListResponse = IPaginatedResponse<IUserListItem>;

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
    getUserCount(query: IUserListQuery): Promise<number>;
    toggleBlockUser(userId: string): Promise<IUser>;
    getPendingProviders(query: IUserListQuery):Promise<IServiceProviderWithUser[]>;
    getPendingProviderCount(query?: IUserListQuery): Promise<number>;
    approveProvider(providerId: string): Promise<void>;
    rejectProvider(providerId: string, reason: string): Promise<void>;
    getProviderDetails(providerId: string): Promise<IServiceProviderDetails>;
    getUserById(userId: string): Promise<IUser | null>;
    getProviderByUserId(userId: string): Promise<IServiceProviderDetails | null>;
}

export interface IUserWithProviderProfile {
    user: IUser;
    providerProfile?: IServiceProviderDetails | null;
}

export interface IAdminService {
    getUsers(query: IUserListQuery): Promise<IUserListResponse>;
    toggleBlockUser(userId: string): Promise<IApiResponse<{ isBlocked: boolean }>>;
    getPendingProviders(query: IUserListQuery): Promise<IUserListResponse>;
    approveProvider(providerId: string): Promise<IApiResponse<void>>;
    rejectProvider(providerId: string, reason: string): Promise<IApiResponse<void>>;
    getProviderDetails(providerId: string): Promise<IApiResponse<IServiceProviderDetails>>;
    getUserById(userId: string): Promise<IApiResponse<IUserWithProviderProfile>>;
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
