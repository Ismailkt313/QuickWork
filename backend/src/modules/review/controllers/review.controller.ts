import { Request, Response, NextFunction } from 'express';
import { IReviewService } from '../interfaces/review.interface';
import { CreateReviewSchema, mapReviewToResponseDTO } from '../dtos/review.dto';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { SuccessMessages } from '../../../constants/messages/successMessages';
import { AppError } from '../../../utils/AppError';
import { IReviewController } from '../interfaces/review.interface';

import { ITokenPayload } from '../../auth/interfaces/auth.interface';

interface RequestWithUser extends Request {
    user?: ITokenPayload;
}

export class ReviewController implements IReviewController {
    private _reviewService: IReviewService;

    constructor(reviewService: IReviewService) {
        this._reviewService = reviewService;
    }

    public createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
             const validationResult = CreateReviewSchema.safeParse(req.body);
            if (!validationResult.success) {
                const errorMessage = validationResult.error.issues.map(issue => issue.message).join(', ');
                throw new AppError(errorMessage, HttpStatusCode.BAD_REQUEST);
            }
             const reviewerId = ((req as RequestWithUser).user as { userId: string }).userId;
             const review = await this._reviewService.createReview(reviewerId, validationResult.data);
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
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const reviewsRes = await this._reviewService.getReviewsForUser(userId as string, page, limit);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: SuccessMessages.REVIEWS_FETCHED,
                data: reviewsRes.data.map(mapReviewToResponseDTO),
                pagination: reviewsRes.pagination,
                meta: reviewsRes.meta
            });
        } catch (error) {
            next(error);
        }
    };

    public getReviewsForAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { assignmentId } = req.params;
            const reviews = await this._reviewService.getReviewsForAssignment(assignmentId as string);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Reviews for assignment fetched successfully",
                data: reviews.map(mapReviewToResponseDTO)
            });
        } catch (error) {
            next(error);
        }
    };

    public getMyReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = ((req as RequestWithUser).user as { userId: string }).userId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const reviewsRes = await this._reviewService.getReviewsForUser(userId as string, page, limit);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Your reviews fetched successfully",
                data: reviewsRes.data.map(mapReviewToResponseDTO),
                pagination: reviewsRes.pagination,
                meta: reviewsRes.meta
            });
        } catch (error) {
            next(error);
        }
    };

    public getProviderReviewsForClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this._reviewService.getProviderReviewsForClient(userId as string, page, limit);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Provider reviews for client fetched successfully",
                data: result.data,
                pagination: result.pagination,
                meta: result.meta
            });
        } catch (error) {
            next(error);
        }
    };

    public updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { reviewId } = req.params;
            const reviewerId = ((req as RequestWithUser).user as { userId: string }).userId;
            const { rating, comment, images } = req.body;

            const updated = await this._reviewService.updateReview(reviewId as string, reviewerId, { rating, comment, images });

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Review updated successfully",
                data: mapReviewToResponseDTO(updated)
            });
        } catch (error) {
            next(error);
        }
    };

    public deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { reviewId } = req.params;
            const reviewerId = ((req as RequestWithUser).user as { userId: string }).userId;

            await this._reviewService.deleteReview(reviewId as string, reviewerId);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Review deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    };
}
