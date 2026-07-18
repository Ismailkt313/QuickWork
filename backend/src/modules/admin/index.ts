import { AdminRepository } from "./repositories/admin.repository";
import { AdminService } from "./services/admin.service";
import { AdminController } from "./controllers/admin.controller";
import { createAdminRouter } from "./routes/admin.routes";

import { AdminDashboardService } from "./services/adminDashboard.service";
import { AdminDashboardController } from "./controllers/adminDashboard.controller";
import { createAdminDashboardRouter } from "./routes/adminDashboard.routes";

import { notificationService } from "../notification";
import { appLogger } from "../../shared/logger";

// Import other module singletons (to be exported next)
import { authRepository } from "../auth";
import { jobRepository } from "../job";
import { serviceProviderRepository } from "../serviceProvider";
import { reportRepository } from "../report";
import { platformTransactionRepository } from "../finance";

export const adminRepository = new AdminRepository();
export const adminService = new AdminService(adminRepository, notificationService, appLogger);
const adminController = new AdminController(adminService);
export const adminRouter = createAdminRouter(adminController);

export const adminDashboardService = new AdminDashboardService(
    authRepository,
    jobRepository,
    serviceProviderRepository,
    reportRepository,
    platformTransactionRepository
);
const adminDashboardController = new AdminDashboardController(adminDashboardService);
export const adminDashboardRouter = createAdminDashboardRouter(adminDashboardController);