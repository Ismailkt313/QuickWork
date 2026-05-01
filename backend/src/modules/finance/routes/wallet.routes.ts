import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';

export const createWalletRouter = (walletController: WalletController) => {
    const router = Router();

    router.get('/me', authMiddleware, walletController.getMe);
    router.get('/transactions', authMiddleware, walletController.getTransactions);
    router.get('/admin/overview', authMiddleware, authorizeRoles('admin'), walletController.getAdminFinanceOverview);

    return router;
};
