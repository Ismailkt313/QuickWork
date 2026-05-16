import { z } from 'zod';
import { REVIEW_ROLE, IReview } from '../interfaces/review.interface';

export const CreateReviewSchema = z.object({
    assignmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid assignmentId"),
    revieweeId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid revieweeId"),
    role: z.nativeEnum(REVIEW_ROLE),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
    images: z.array(z.string()).optional()
});

export type CreateReviewDTO = z.infer<typeof CreateReviewSchema>;

export interface ReviewResponseDTO {
    id: string;
    assignmentId: string;
    reviewerId: {
        id: string;
        name: string;
    };
    revieweeId: {
        id: string;
        name: string;
    };
    role: REVIEW_ROLE;
    rating: number;
    comment?: string;
    images?: string[];
    createdAt: Date;
}

export const mapReviewToResponseDTO = (review: IReview): ReviewResponseDTO => {
    const reviewer = review.reviewerId as unknown as { _id: { toString(): string }; name: string };
    const reviewee = review.revieweeId as unknown as { _id: { toString(): string }; name: string };
    return {
        id: (review._id as { toString(): string }).toString(),
        assignmentId: review.assignmentId.toString(),
        reviewerId: {
            id: reviewer._id ? reviewer._id.toString() : review.reviewerId.toString(),
            name: reviewer.name || ''
        },
        revieweeId: {
            id: reviewee._id ? reviewee._id.toString() : review.revieweeId.toString(),
            name: reviewee.name || ''
        },
        role: review.role,
        rating: review.rating,
        comment: review.comment,
        images: review.images,
        createdAt: review.createdAt
    };
};
