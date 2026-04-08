import { AssignmentRepository } from './repositories/assignment.repository';
import { AssignmentService } from './services/assignment.service';
import { AssignmentController } from './controller/assignment.controller';
import { createAssignmentRouter } from './routes/assignment.routes';
import { ServiceProviderRepository } from '../serviceProvider/repositories/serviceProvider.repository';
import { JobRepository } from '../job/repositories/job.repository';

const assignmentRepository = new AssignmentRepository();
const jobRepository = new JobRepository();
const assignmentService = new AssignmentService(assignmentRepository, jobRepository);

const serviceProviderRepository = new ServiceProviderRepository();

const assignmentController = new AssignmentController(assignmentService, serviceProviderRepository);

const assignmentRouter = createAssignmentRouter(assignmentController);

export {
    assignmentRouter,
    assignmentService
};
