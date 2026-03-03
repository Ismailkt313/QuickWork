import { Document, Types } from 'mongoose';

export interface ILocation {
    id: string;
    name: string;
    lat: number;
    lon: number;
}

export interface IPortfolioItem {
    title: string;
    description?: string;
    images: string[];
}

export interface IVerification {
    status: 'pending' | 'verified' | 'rejected';
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
