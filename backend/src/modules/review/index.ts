import { ReviewRepository } from './repositories/review.repository';
import { ReviewService } from './services/review.service';
import { ReviewController } from './controllers/review.controller';
import { createReviewRouter } from './routes/review.routes';

import { AssignmentRepository } from '../assignment/repositories/assignment.repository';
import { JobRepository } from '../job/repositories/job.repository';

const reviewRepository = new ReviewRepository();
const assignmentRepository = new AssignmentRepository();
const jobRepository = new JobRepository();
const reviewService = new ReviewService(reviewRepository, assignmentRepository, jobRepository);
const reviewController = new ReviewController(reviewService);

export const reviewRouter = createReviewRouter(reviewController);
