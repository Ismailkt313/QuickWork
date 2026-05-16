import { Document, Types } from 'mongoose';

export enum REVIEW_ROLE {
    CLIENT_TO_PROVIDER = 'client_to_provider',
    PROVIDER_TO_CLIENT = 'provider_to_client'
}

export interface IReview extends Document {
    assignmentId: Types.ObjectId;
    reviewerId: Types.ObjectId;
    revieweeId: Types.ObjectId;
    role: REVIEW_ROLE;
    rating: number;
    comment?: string;
    images?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IReviewPaginatedResponse {
    data: IReview[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    meta: {
        averageRating: number;
        totalReviews: number;
    };
}

import { IBaseRepository } from '../../../shared/interfaces/base.repository.interface';

export interface IReviewRepository extends IBaseRepository<IReview> {
    findByUser(userId: string, page: number, limit: number): Promise<IReviewPaginatedResponse>;
    findByRevieweeAndRole(revieweeId: string, role: string, page: number, limit: number): Promise<IReviewPaginatedResponse>;
    findByAssignment(assignmentId: string): Promise<IReview[]>;
    exists(query: Record<string, unknown>): Promise<boolean>;

    getDashboardStats(revieweeId: string): Promise<{ averageRating: number; totalReviews: number }>;
    findRecentReviews(revieweeId: string, limit: number): Promise<IReview[]>;
}

import { CreateReviewDTO } from '../dtos/review.dto';

export interface IReviewService {
    createReview(reviewerId: string, data: CreateReviewDTO): Promise<IReview>;
    getReviewsForUser(userId: string, page: number, limit: number): Promise<IReviewPaginatedResponse>;
    getReviewsForAssignment(assignmentId: string): Promise<IReview[]>;
    getProviderReviewsForClient(clientId: string, page: number, limit: number): Promise<IReviewPaginatedResponse>;
    updateReview(reviewId: string, reviewerId: string, data: { rating?: number; comment?: string; images?: string[] }): Promise<IReview>;
    deleteReview(reviewId: string, reviewerId: string): Promise<void>;
}

import { Request, Response, NextFunction } from 'express';

export interface IReviewController {
    createReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReviewsForUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReviewsForAssignment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProviderReviewsForClient(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteReview(req: Request, res: Response, next: NextFunction): Promise<void>;
}
