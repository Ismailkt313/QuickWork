import { IReview, IReviewRepository } from '../interfaces/review.interface';
import { ReviewModel } from '../models/review.model';

export class ReviewRepository implements IReviewRepository {
    async create(data: Partial<IReview>): Promise<IReview> {
        const review = new ReviewModel(data);
        return await review.save();
    }

    async findByUser(userId: string): Promise<IReview[]> {
        return await ReviewModel.find({ revieweeId: userId })
            .populate('reviewerId', 'name')
            .populate('revieweeId', 'name')
            .sort({ createdAt: -1 });
    }

    async findByAssignment(assignmentId: string): Promise<IReview[]> {
        return await ReviewModel.find({ assignmentId })
            .populate('reviewerId', 'name')
            .populate('revieweeId', 'name');
    }

    async exists(query: any): Promise<boolean> {
        const count = await ReviewModel.countDocuments(query);
        return count > 0;
    }
}
