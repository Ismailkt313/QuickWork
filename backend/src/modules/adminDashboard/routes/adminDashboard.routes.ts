import { Router } from "express";
import { AdminDashboardController } from "../controllers/adminDashboard.controller";
import { AdminDashboardService } from "../services/adminDashboard.service";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorizeRoles } from "../../../middleware/role.middleware";
import { ROLES } from "../../../constants/roles";

const router = Router();
const adminDashboardService = new AdminDashboardService();
const adminDashboardController = new AdminDashboardController(adminDashboardService);

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.ADMIN));

router.get("/overview", adminDashboardController.getOverview);
router.get("/activity", adminDashboardController.getRecentActivity);
router.get("/charts", adminDashboardController.getChartData);
router.get("/finance-summary", adminDashboardController.getFinanceSummary);

export default router;
