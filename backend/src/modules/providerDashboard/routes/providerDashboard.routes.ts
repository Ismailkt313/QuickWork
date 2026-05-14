import { Router } from 'express';
import { ProviderDashboardController } from '../controllers/providerDashboard.controller';
import { ProviderDashboardService } from '../services/providerDashboard.service';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';
import { ROLES } from '../../../constants/roles';

// Repositories
import { ServiceProviderRepository } from '../../serviceProvider/repositories/serviceProvider.repository';
import { AssignmentRepository } from '../../assignment/repositories/assignment.repository';
import { WalletRepository } from '../../finance/repositories/wallet.repository';
import { WorkHistoryRepository } from '../../finance/repositories/workHistory.repository';
import { ReviewRepository } from '../../review/repositories/review.repository';
import { NotificationRepository } from '../../notification/repositories/notification.repository';

const router = Router();

const providerRepo = new ServiceProviderRepository();
const assignmentRepo = new AssignmentRepository();
const walletRepo = new WalletRepository();
const workHistoryRepo = new WorkHistoryRepository();
const reviewRepo = new ReviewRepository();
const notificationRepo = new NotificationRepository();

const service = new ProviderDashboardService(
    providerRepo,
    assignmentRepo,
    walletRepo,
    workHistoryRepo,
    reviewRepo,
    notificationRepo
);
const controller = new ProviderDashboardController(service);

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.PROVIDER));

router.get('/overview', controller.getOverview);
router.get('/activity', controller.getActivity);
router.get('/charts', controller.getCharts);
router.get('/performance', controller.getPerformance);
router.get('/availability-summary', controller.getAvailabilitySummary);

export default router;
