import { JobRepository } from './repositories/job.repository';
import { JobService } from './services/job.service';
import { JobController } from './controllers/job.controller';
import { createJobRouter } from './routes/job.routes';
import { ServiceProviderRepository } from '../serviceProvider/repositories/serviceProvider.repository';
import { assignmentService } from '../assignment';

const jobRepository = new JobRepository();
const serviceProviderRepository = new ServiceProviderRepository();

const jobService = new JobService(jobRepository, serviceProviderRepository, assignmentService);
const jobController = new JobController(jobService);

const jobRouter = createJobRouter(jobController);

export {
    jobRouter
};
