import { ServiceProviderRepository } from "./repositories/serviceProvider.repository";
import { ServiceProviderService } from "./services/serviceProvider.service";
import { ServiceProviderController } from "./controllers/serviceProvider.controller";
import { createServiceProviderRouter } from "./routes/serviceProvider.routes";

import { ProviderDashboardService } from "./services/providerDashboard.service";
import { ProviderDashboardController } from "./controllers/providerDashboard.controller";
import { createProviderDashboardRouter } from "./routes/providerDashboard.routes";

// Import other module singletons
import { authRepository } from "../auth";
import { skillRepository } from "../skill";
import { assignmentRepository } from "../assignment";
import { walletRepository, workHistoryRepository } from "../finance";
import { reviewRepository } from "../review";
import { notificationRepository } from "../notification";

export const serviceProviderRepository = new ServiceProviderRepository();
export const serviceProviderService = new ServiceProviderService(serviceProviderRepository, authRepository, skillRepository);
const serviceProviderController = new ServiceProviderController(serviceProviderService);

export const serviceProviderRouter = createServiceProviderRouter(serviceProviderController);

export const providerDashboardService = new ProviderDashboardService(
    serviceProviderRepository,
    assignmentRepository,
    walletRepository,
    workHistoryRepository,
    reviewRepository,
    notificationRepository
);
const providerDashboardController = new ProviderDashboardController(providerDashboardService);
export const providerDashboardRouter = createProviderDashboardRouter(providerDashboardController);
