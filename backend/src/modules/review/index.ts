import { ReviewRepository } from './repositories/review.repository';
import { ReviewService } from './services/review.service';
import { ReviewController } from './controllers/review.controller';
import { createReviewRouter } from './routes/review.routes';

// Import singletons from other modules
import { assignmentRepository } from '../assignment';
import { jobRepository } from '../job';

export const reviewRepository = new ReviewRepository();
export const reviewService = new ReviewService(reviewRepository, assignmentRepository, jobRepository);
const reviewController = new ReviewController(reviewService);

export const reviewRouter = createReviewRouter(reviewController);
