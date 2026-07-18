import { AssignmentRepository } from './repositories/assignment.repository';
import { AssignmentService } from './services/assignment.service';
import { AssignmentController } from './controller/assignment.controller';
import { createAssignmentRouter } from './routes/assignment.routes';
import { notificationService } from '../notification';
import { workHistoryService, paymentService } from '../finance';
import { appLogger } from '../../shared/logger';

// Import jobRepository singleton
import { jobRepository } from '../job';

export const assignmentRepository = new AssignmentRepository();

export const assignmentService = new AssignmentService(
    assignmentRepository,
    jobRepository,
    notificationService,
    workHistoryService,
    paymentService,
    appLogger
);

// Import serviceProviderService at the bottom to avoid circular import issues
import { serviceProviderService } from '../serviceProvider';

const assignmentController = new AssignmentController(assignmentService, serviceProviderService);
export const assignmentRouter = createAssignmentRouter(assignmentController);
