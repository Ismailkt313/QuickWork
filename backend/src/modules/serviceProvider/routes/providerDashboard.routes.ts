import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';
import { ROLES } from '../../../constants/roles';
import { IProviderDashboardController } from '../interfaces/providerDashboard.interface';

export const createProviderDashboardRouter = (controller: IProviderDashboardController): Router => {
    const router = Router();

    router.use(authMiddleware);
    router.use(authorizeRoles(ROLES.PROVIDER));

    router.get('/overview', controller.getOverview);
    router.get('/activity', controller.getActivity);
    router.get('/charts', controller.getCharts);
    router.get('/performance', controller.getPerformance);
    router.get('/availability-summary', controller.getAvailabilitySummary);

    return router;
};
