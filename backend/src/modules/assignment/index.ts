import { AssignmentRepository } from './repositories/assignment.repository';
import { AssignmentService } from './services/assignment.service';
import { AssignmentController } from './controller/assignment.controller';
import { createAssignmentRouter } from './routes/assignment.routes';
import { JobRepository } from '../job/repositories/job.repository';
import { notificationService } from '../notification';
import { workHistoryService, paymentService } from '../finance';
import { appLogger } from '../../shared/logger';

const assignmentRepository = new AssignmentRepository();
const jobRepository = new JobRepository();

const assignmentService = new AssignmentService(assignmentRepository, jobRepository, notificationService, workHistoryService, paymentService, appLogger);


import { serviceProviderService } from '../serviceProvider';

const assignmentController = new AssignmentController(assignmentService, serviceProviderService);

const assignmentRouter = createAssignmentRouter(assignmentController);

export {
    assignmentRouter,
    assignmentService
};
