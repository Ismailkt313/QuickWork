import { JobRepository } from './repositories/job.repository';
import { JobService } from './services/job.service';
import { JobController } from './controllers/job.controller';
import { createJobRouter } from './routes/job.routes';
import { createAdminJobRouter } from './routes/admin.job.routes';
import { ServiceProviderRepository } from '../serviceProvider/repositories/serviceProvider.repository';
import { assignmentService } from '../assignment';
import { LocationRepository } from '../location/repositories/location.repository';
import { notificationService } from '../notification';
import { AssignmentRepository } from '../assignment/repositories/assignment.repository';

import { WorkHistoryRepository } from "../finance/repositories/workHistory.repository";
import { reviewRepository } from "../review";

const jobRepository = new JobRepository();
const serviceProviderRepository = new ServiceProviderRepository();
const locationRepository = new LocationRepository();
const assignmentRepository = new AssignmentRepository();
const workHistoryRepository = new WorkHistoryRepository();

const jobService = new JobService(jobRepository, serviceProviderRepository, assignmentService, locationRepository, notificationService, workHistoryRepository, reviewRepository);
const jobController = new JobController(jobService, assignmentRepository);

const jobRouter = createJobRouter(jobController);
const adminJobRouter = createAdminJobRouter(jobController);

export {
    jobRouter,
    adminJobRouter
};
