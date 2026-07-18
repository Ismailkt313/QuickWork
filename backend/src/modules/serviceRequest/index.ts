import { ServiceRequestRepository } from './repositories/serviceRequest.repository';
import { SkillRepository } from '../skill/repositories/skill.repository';
import { ServiceProviderRepository } from '../serviceProvider/repositories/serviceProvider.repository';
import { ServiceRequestService } from './services/serviceRequest.service';
import { ServiceRequestController } from './controllers/serviceRequest.controller';
import { createServiceRequestRouter, createAdminServiceRequestRouter } from './routes/serviceRequest.routes';

import { appLogger } from '../../shared/logger';

const serviceRequestRepository = new ServiceRequestRepository();
const skillRepository = new SkillRepository();
const serviceProviderRepository = new ServiceProviderRepository();

const serviceRequestService = new ServiceRequestService(
    serviceRequestRepository,
    skillRepository,
    serviceProviderRepository,
    appLogger
);

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
