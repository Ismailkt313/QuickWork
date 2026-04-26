import { IReview, IReviewRepository, IReviewService } from '../interfaces/review.interface';
import { Types } from 'mongoose';
import { AssignmentModel } from '../../assignment/models/assignment.model';
import { JobModel } from '../../job/models/job.model';
import { AppError } from '../../../utils/AppError';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { CreateReviewDTO } from '../dtos/review.dto';

export class ReviewService implements IReviewService {
    private reviewRepository: IReviewRepository;

    constructor(reviewRepository: IReviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    async createReview(reviewerId: string, data: CreateReviewDTO): Promise<IReview> {
         if (reviewerId === data.revieweeId) {
            throw new AppError("You cannot review yourself", HttpStatusCode.BAD_REQUEST);
        }

         const assignment = await AssignmentModel.findById(data.assignmentId);
        if (!assignment) {
            throw new AppError("Assignment not found", HttpStatusCode.NOT_FOUND);
        }

         
        const job = await JobModel.findById(assignment.jobId);
        if (!job || assignment.workStatus !== 'completed') {
            throw new AppError("Reviews are only allowed for completed jobs", HttpStatusCode.BAD_REQUEST);
        }

        // 4. Prevent duplicate review per role
        const alreadyReviewed = await this.reviewRepository.exists({
            assignmentId: data.assignmentId,
            role: data.role
        });
        if (alreadyReviewed) {
            throw new AppError("Review already submitted for this assignment and role", HttpStatusCode.CONFLICT);
        }

        // 5. Create review
        return await this.reviewRepository.create({
            ...data,
            assignmentId: new Types.ObjectId(data.assignmentId) as any,
            revieweeId: new Types.ObjectId(data.revieweeId) as any,
            reviewerId: new Types.ObjectId(reviewerId) as any
        });
    }

    async getReviewsForUser(userId: string): Promise<IReview[]> {
        return await this.reviewRepository.findByUser(userId);
    }

    async getReviewsForAssignment(assignmentId: string): Promise<IReview[]> {
        return await this.reviewRepository.findByAssignment(assignmentId);
    }
}
