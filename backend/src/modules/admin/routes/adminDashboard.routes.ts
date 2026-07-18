import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorizeRoles } from "../../../middleware/role.middleware";
import { ROLES } from "../../../constants/roles";
import { IAdminDashboardController } from "../interfaces/adminDashboard.interface";

export const createAdminDashboardRouter = (adminDashboardController: IAdminDashboardController): Router => {
    const router = Router();

    router.use(authMiddleware);
    router.use(authorizeRoles(ROLES.ADMIN));

    router.get("/overview", adminDashboardController.getOverview);
    router.get("/activity", adminDashboardController.getRecentActivity);
    router.get("/charts", adminDashboardController.getChartData);
    router.get("/finance-summary", adminDashboardController.getFinanceSummary);

    return router;
};
