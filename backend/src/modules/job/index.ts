import { JobRepository } from './repositories/job.repository';
import { JobService } from './services/job.service';
import { JobController } from './controllers/job.controller';
import { createJobRouter } from './routes/job.routes';
import { createAdminJobRouter } from './routes/admin.job.routes';
import { assignmentService } from '../assignment';
import { notificationService } from '../notification';
import { appLogger } from '../../shared/logger';

// Import singletons from other modules
import { serviceProviderRepository } from '../serviceProvider';
import { locationRepository } from '../location';
import { workHistoryRepository } from '../finance';
import { reviewRepository } from '../review';

export const jobRepository = new JobRepository();

export const jobService = new JobService(
    jobRepository,
    serviceProviderRepository,
    assignmentService,
    locationRepository,
    notificationService,
    workHistoryRepository,
    reviewRepository,
    appLogger
);

const jobController = new JobController(jobService, assignmentService);

export const jobRouter = createJobRouter(jobController);
export const adminJobRouter = createAdminJobRouter(jobController);
