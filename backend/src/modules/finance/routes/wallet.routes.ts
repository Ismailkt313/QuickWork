import { Router } from 'express';
import { IWalletController } from '../interfaces/finance.interface';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';

export const createWalletRouter = (walletController: IWalletController) => {
    const router = Router();

    router.get('/me', authMiddleware, walletController.getMe);
    router.get('/transactions', authMiddleware, walletController.getTransactions);
    router.post('/withdraw', authMiddleware, authorizeRoles('provider'), walletController.withdraw);
    router.get('/admin/overview', authMiddleware, authorizeRoles('admin'), walletController.getAdminFinanceOverview);

    return router;
};
