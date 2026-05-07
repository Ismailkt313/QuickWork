import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

export const createReviewRouter = (reviewController: ReviewController): Router => {
    const router = Router();

    router.post('/', authMiddleware, reviewController.createReview);
    router.get('/me', authMiddleware, reviewController.getMyReviews);
    router.get('/user/:userId', reviewController.getReviewsForUser);
    router.get('/client/:userId', reviewController.getProviderReviewsForClient);
    router.get('/assignment/:assignmentId', reviewController.getReviewsForAssignment);
    router.put('/:reviewId', authMiddleware, reviewController.updateReview);
    router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);

    return router;
};
