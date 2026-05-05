import { IReview, IReviewRepository, IReviewService } from '../interfaces/review.interface';
import { Types } from 'mongoose';
import { IAssignmentRepository } from '../../assignment/interfaces/assignment.interface';
import { IJobRepository } from '../../job/interfaces/job.interface';
import { AppError } from '../../../utils/AppError';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { CreateReviewDTO } from '../dtos/review.dto';

export class ReviewService implements IReviewService {
    private _reviewRepository: IReviewRepository;
    private _assignmentRepository: IAssignmentRepository;
    private _jobRepository: IJobRepository;

    constructor(
        reviewRepository: IReviewRepository,
        assignmentRepository: IAssignmentRepository,
        jobRepository: IJobRepository
    ) {
        this._reviewRepository = reviewRepository;
        this._assignmentRepository = assignmentRepository;
        this._jobRepository = jobRepository;
    }

    async createReview(reviewerId: string, data: CreateReviewDTO): Promise<IReview> {
         if (reviewerId === data.revieweeId) {
            throw new AppError("You cannot review yourself", HttpStatusCode.BAD_REQUEST);
        }

         const assignment = await this._assignmentRepository.findById(data.assignmentId);
        if (!assignment) {
            throw new AppError("Assignment not found", HttpStatusCode.NOT_FOUND);
        }

         
         const jobId = (assignment.jobId as any)._id?.toString() || assignment.jobId.toString();
         const job = await this._jobRepository.findById(jobId);
        if (!job || assignment.workStatus !== 'completed') {
            throw new AppError("Reviews are only allowed for completed jobs", HttpStatusCode.BAD_REQUEST);
        }

        
        const alreadyReviewed = await this._reviewRepository.exists({
            assignmentId: data.assignmentId,
            role: data.role
        });
        if (alreadyReviewed) {
            throw new AppError("Review already submitted for this assignment and role", HttpStatusCode.CONFLICT);
        }

        
        return await this._reviewRepository.create({
            ...data,
            assignmentId: new Types.ObjectId(data.assignmentId) as any,
            revieweeId: new Types.ObjectId(data.revieweeId) as any,
            reviewerId: new Types.ObjectId(reviewerId) as any
        });
    }

    async getReviewsForUser(userId: string): Promise<IReview[]> {
        return await this._reviewRepository.findByUser(userId);
    }

    async getReviewsForAssignment(assignmentId: string): Promise<IReview[]> {
        return await this._reviewRepository.findByAssignment(assignmentId);
    }
}
