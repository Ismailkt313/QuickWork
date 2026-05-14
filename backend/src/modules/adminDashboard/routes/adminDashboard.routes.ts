import { Router } from "express";
import { AdminDashboardController } from "../controllers/adminDashboard.controller";
import { AdminDashboardService } from "../services/adminDashboard.service";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorizeRoles } from "../../../middleware/role.middleware";
import { ROLES } from "../../../constants/roles";

// Import Repositories
import { AuthRepository } from "../../auth/repositories/auth.repository";
import { JobRepository } from "../../job/repositories/job.repository";
import { ServiceProviderRepository } from "../../serviceProvider/repositories/serviceProvider.repository";
import { ReportRepository } from "../../report/repositories/report.repository";
import { PlatformTransactionRepository } from "../../finance/repositories/platformTransaction.repository";

const router = Router();

// Instantiate Repositories
const authRepo = new AuthRepository();
const jobRepo = new JobRepository();
const providerRepo = new ServiceProviderRepository();
const reportRepo = new ReportRepository();
const transactionRepo = new PlatformTransactionRepository();

const adminDashboardService = new AdminDashboardService(
    authRepo,
    jobRepo,
    providerRepo,
    reportRepo,
    transactionRepo
);
const adminDashboardController = new AdminDashboardController(adminDashboardService);

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.ADMIN));

router.get("/overview", adminDashboardController.getOverview);
router.get("/activity", adminDashboardController.getRecentActivity);
router.get("/charts", adminDashboardController.getChartData);
router.get("/finance-summary", adminDashboardController.getFinanceSummary);

export default router;
