import { IReview, IReviewRepository, IReviewService } from '../interfaces/review.interface';
import { Types } from 'mongoose';
import { IAssignmentRepository } from '../../assignment/interfaces/assignment.interface';
import { IJobRepository } from '../../job/interfaces/job.interface';
import { AppError } from '../../../utils/AppError';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { CreateReviewDTO } from '../dtos/review.dto';

export class ReviewService implements IReviewService {
    private reviewRepository: IReviewRepository;
    private assignmentRepository: IAssignmentRepository;
    private jobRepository: IJobRepository;

    constructor(
        reviewRepository: IReviewRepository,
        assignmentRepository: IAssignmentRepository,
        jobRepository: IJobRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.assignmentRepository = assignmentRepository;
        this.jobRepository = jobRepository;
    }

    async createReview(reviewerId: string, data: CreateReviewDTO): Promise<IReview> {
         if (reviewerId === data.revieweeId) {
            throw new AppError("You cannot review yourself", HttpStatusCode.BAD_REQUEST);
        }

         const assignment = await this.assignmentRepository.findById(data.assignmentId);
        if (!assignment) {
            throw new AppError("Assignment not found", HttpStatusCode.NOT_FOUND);
        }

         
        const job = await this.jobRepository.findById(assignment.jobId.toString());
        if (!job || assignment.workStatus !== 'completed') {
            throw new AppError("Reviews are only allowed for completed jobs", HttpStatusCode.BAD_REQUEST);
        }

        
        const alreadyReviewed = await this.reviewRepository.exists({
            assignmentId: data.assignmentId,
            role: data.role
        });
        if (alreadyReviewed) {
            throw new AppError("Review already submitted for this assignment and role", HttpStatusCode.CONFLICT);
        }

        
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
