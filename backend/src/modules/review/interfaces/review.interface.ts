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

export interface IReviewRepository {
    create(data: Partial<IReview>): Promise<IReview>;
    findByUser(userId: string): Promise<IReview[]>;
    findByAssignment(assignmentId: string): Promise<IReview[]>;
    exists(query: any): Promise<boolean>;
}

export interface IReviewService {
    createReview(reviewerId: string, data: any): Promise<IReview>;
    getReviewsForUser(userId: string): Promise<IReview[]>;
    getReviewsForAssignment(assignmentId: string): Promise<IReview[]>;
}
