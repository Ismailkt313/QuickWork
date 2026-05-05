import { Document, Types } from 'mongoose';
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
}

export interface ProviderListResult {
    providers: ProviderListItem[];
    total: number;
}

export interface IServiceProviderRepository {
    findByUserId(userId: string): Promise<any>;
    create(providerData: Partial<IServiceProvider>): Promise<IServiceProvider>;
    addSkillToProvider(userId: string, skillId: string): Promise<any>;
    findProviders(filter: ProviderFilter): Promise<ProviderListResult>;
    findById(id: string): Promise<any>;
    updateByUserId(userId: string, data: any): Promise<any>;
    deleteByUserId(userId: string): Promise<void>;
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
    }): Promise<{ success: boolean; message?: string; data?: ProviderListResult & { page: number; limit: number } }>;
    getProviderById(id: string): Promise<{ success: boolean; data?: any; message?: string }>;
    getMyProfile(userId: string): Promise<{ success: boolean; data?: any; message?: string }>;
    updateProfile(userId: string, data: any): Promise<{ success: boolean; data?: any; message?: string }>;
    resetApplication(userId: string): Promise<{ success: boolean; message: string }>;
}

export interface IServiceProviderController {
    submitApplication(req: any, res: any, next: any): Promise<void>;
    getProviders(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProviderById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    resetApplication(req: Request, res: Response, next: NextFunction): Promise<void>;
}