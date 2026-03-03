import { ServiceRequestRepository } from './repositories/serviceRequest.repository';
import { SkillRepository } from '../skill/repositories/skill.repository';
import { ServiceRequestService } from './services/serviceRequest.service';
import { ServiceRequestController } from './controllers/serviceRequest.controller';
import { createServiceRequestRouter, createAdminServiceRequestRouter } from './routes/serviceRequest.routes';

const serviceRequestRepository = new ServiceRequestRepository();
const skillRepository = new SkillRepository();
const serviceRequestService = new ServiceRequestService(serviceRequestRepository, skillRepository);
const serviceRequestController = new ServiceRequestController(serviceRequestService);

const serviceRequestRouter = createServiceRequestRouter(serviceRequestController);
const adminServiceRequestRouter = createAdminServiceRequestRouter(serviceRequestController);

export {
    serviceRequestRouter,
    adminServiceRequestRouter,
    ServiceRequestRepository,
    ServiceRequestService,
    ServiceRequestController
};
