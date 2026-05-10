import { Router } from 'express';
import { ProviderDashboardController } from '../controllers/providerDashboard.controller';
import { ProviderDashboardService } from '../services/providerDashboard.service';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';
import { ROLES } from '../../../constants/roles';

const router = Router();
const service = new ProviderDashboardService();
const controller = new ProviderDashboardController(service);

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.PROVIDER));

router.get('/overview', controller.getOverview);
router.get('/activity', controller.getActivity);
router.get('/charts', controller.getCharts);
router.get('/performance', controller.getPerformance);
router.get('/availability-summary', controller.getAvailabilitySummary);

export default router;
