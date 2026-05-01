import { Router } from 'express';
import { AdminFinanceController } from '../controllers/adminFinance.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';
import { ROLES } from '../../../constants/roles';

export const createAdminFinanceRouter = (controller: AdminFinanceController) => {
    const router = Router();

    router.get('/overview', authMiddleware, authorizeRoles(ROLES.ADMIN), controller.getOverview);
    router.get('/transactions', authMiddleware, authorizeRoles(ROLES.ADMIN), controller.getTransactions);

    return router;
};
