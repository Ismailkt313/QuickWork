import { IUser } from "../../auth/interfaces/auth.interface";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";


export enum ROLES {
    ADMIN = "admin",
    USER = "user",
    PROVIDER = "provider"
}

export interface IUserListQuery {
    page: number;
    limit: number;
    search?: string;
}

export interface IUserListItem {
    id: string;
    name: string;
    email: string;
    role: string;
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
    status: string
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
}

export interface IAdminService {
    getUsers(query: IUserListQuery): Promise<IUserListResponse>;
    toggleBlockUser(userId: string): Promise<{ success: boolean; message: string; data: { isBlocked: boolean } }>;
    getPendingProviders(): Promise<IUserListResponse>;
    approveProvider(providerId: string): Promise<{ success: boolean; message: string }>;
    rejectProvider(providerId: string, reason: string): Promise<{ success: boolean; message: string }>;
}

export interface IAdminController {
    getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    toggleBlockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPendingProviders(req: Request, res: Response, next: NextFunction): Promise<void>;
    approveProvider(req: Request, res: Response, next: NextFunction): Promise<void>;
    rejectProvider(req: Request, res: Response, next: NextFunction): Promise<void>;
}
