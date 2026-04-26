import { Request, Response, NextFunction } from 'express';
import { IReviewService } from '../interfaces/review.interface';
import { CreateReviewSchema, mapReviewToResponseDTO } from '../dtos/review.dto';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { SuccessMessages } from '../../../constants/messages/successMessages';
import { AppError } from '../../../utils/AppError';

export class ReviewController {
    private reviewService: IReviewService;

    constructor(reviewService: IReviewService) {
        this.reviewService = reviewService;
    }

    public createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
             const validationResult = CreateReviewSchema.safeParse(req.body);
            if (!validationResult.success) {
                const errorMessage = validationResult.error.issues.map(issue => issue.message).join(', ');
                throw new AppError(errorMessage, HttpStatusCode.BAD_REQUEST);
            }
             const reviewerId = (req.user as any).userId;
             const review = await this.reviewService.createReview(reviewerId, validationResult.data);
             res.status(HttpStatusCode.CREATED).json({
                success: true,
                message: SuccessMessages.REVIEW_CREATED,
                data: review
            });
        } catch (error) {
            next(error);
        }
    };

    public getReviewsForUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId } = req.params;
            const reviews = await this.reviewService.getReviewsForUser(userId as string);
            
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: SuccessMessages.REVIEWS_FETCHED,
                data: reviews.map(mapReviewToResponseDTO)
            });
        } catch (error) {
            next(error);
        }
    };

    public getReviewsForAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { assignmentId } = req.params;
            const reviews = await this.reviewService.getReviewsForAssignment(assignmentId as string);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Reviews for assignment fetched successfully",
                data: reviews.map(mapReviewToResponseDTO)
            });
        } catch (error) {
            next(error);
        }
    };
}
