import { Document, Types, UpdateWriteOpResult } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { SubmitApplicationDTO } from '../dtos/submitApplication.dto';
import { VERIFICATION_STATUS } from '../../../constants/verification';

export interface ILocation {
    id: string;
    name: string;
}

export interface IPortfolioItem {
    title: string;
    description?: string;
    images: string[];
}

export interface IVerification {
    status: VERIFICATION_STATUS;
    verifiedBy?: Types.ObjectId;
    verifiedAt?: Date;
    rejectionReason?: string;
}

export interface IAvailability {
    day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

export interface IBlockedDate {
    _id?: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    reason: string;
}

export interface IServiceProvider extends Document {
    userId: Types.ObjectId;
    headline: string;
    about: string;
    profileImage: string;
    skills: Types.ObjectId[];
    yearsOfExperience: number;
    hourlyRate: number;
    location: ILocation;
    portfolio: IPortfolioItem[];
    verification: IVerification;
    isActive: boolean;
    availability: IAvailability[];
    blockedDates: IBlockedDate[];
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProviderListItem {
    id: string;
    headline: string;
    profileImage: string;
    hourlyRate: number;
    yearsOfExperience: number;
    location: ILocation;
}

export interface ProviderFilter {
    skillId?: string;
    locationId?: string;
    page: number;
    limit: number;
    search?: string;
    sort?: string;
    currentUserId?: string;
}

export interface ProviderListResult {
    providers: ProviderListItem[];
    total: number;
}

export interface IServiceProviderRepository {
    findByUserId(userId: string): Promise<IServiceProvider | null>;
    create(providerData: Partial<IServiceProvider>): Promise<IServiceProvider>;
    addSkillToProvider(userId: string, skillId: string): Promise<UpdateWriteOpResult>;
    findProviders(filter: ProviderFilter): Promise<ProviderListResult>;
    findById(id: string): Promise<IServiceProvider | null>;
    updateByUserId(userId: string, data: Partial<IServiceProvider>): Promise<IServiceProvider | null>;
    deleteByUserId(userId: string): Promise<void>;
    updateAvailability(userId: string, availability: IAvailability[]): Promise<IServiceProvider | null>;
    addBlockedDate(userId: string, blockedDate: IBlockedDate): Promise<IServiceProvider | null>;
    deleteBlockedDate(userId: string, blockedDateId: string): Promise<IServiceProvider | null>;
    countTotalProviders(): Promise<number>;
    countPendingApprovals(): Promise<number>;
    getRecentProviders(limit: number): Promise<IServiceProvider[]>;
    getProviderGrowth(): Promise<{ _id: string; count: number }[]>;
}

export interface IServiceProviderService {
    submitApplication(userId: string, providerData: SubmitApplicationDTO): Promise<{ success: boolean; data?: { providerId: string; accessToken: string; refreshToken: string }; message?: string }>;
    getProviders(params: {
        skillId?: string;
        locationId?: string;
        page?: number;
        limit?: number;
        search?: string;
        sort?: string;
        currentUserId?: string;
    }): Promise<{ success: boolean; message?: string; data?: ProviderListResult & { page: number; limit: number } }>;
    getProviderById(id: string): Promise<{ success: boolean; data?: IServiceProvider; message?: string }>;
    getMyProfile(userId: string): Promise<{ success: boolean; data?: IServiceProvider; message?: string }>;
    getProviderByUserId(userId: string): Promise<IServiceProvider | null>;
    updateProfile(userId: string, data: Partial<IServiceProvider>): Promise<{ success: boolean; data?: IServiceProvider; message?: string }>;
    resetApplication(userId: string): Promise<{ success: boolean; message: string }>;
    updateAvailability(userId: string, availability: IAvailability[]): Promise<{ success: boolean; message: string; data?: IAvailability[] }>;
    addBlockedDate(userId: string, blockedDate: IBlockedDate): Promise<{ success: boolean; message: string; data?: IBlockedDate[] }>;
    deleteBlockedDate(userId: string, blockedDateId: string): Promise<{ success: boolean; message: string }>;
}

export interface IServiceProviderController {
    submitApplication(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProviders(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProviderById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    resetApplication(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateAvailability(req: Request, res: Response, next: NextFunction): Promise<void>;
    addBlockedDate(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteBlockedDate(req: Request, res: Response, next: NextFunction): Promise<void>;
}