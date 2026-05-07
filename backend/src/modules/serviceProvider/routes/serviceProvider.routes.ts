import { Router } from 'express';
import { IServiceProviderController } from '../interfaces/serviceProvider.interface';
import { authMiddleware } from '../../../middleware/auth.middleware';

export const createServiceProviderRouter = (serviceProviderController: IServiceProviderController): Router => {
    const router = Router();

    router.post('/apply', authMiddleware, serviceProviderController.submitApplication);
    router.get('/list', authMiddleware, serviceProviderController.getProviders);
    router.get('/profile', authMiddleware, serviceProviderController.getMyProfile);
    router.patch('/profile', authMiddleware, serviceProviderController.updateProfile);
    router.patch('/availability', authMiddleware, serviceProviderController.updateAvailability);
    router.post('/blocked-dates', authMiddleware, serviceProviderController.addBlockedDate);
    router.delete('/blocked-dates/:id', authMiddleware, serviceProviderController.deleteBlockedDate);
    router.get('/:id', authMiddleware, serviceProviderController.getProviderById);
    router.post('/reset', authMiddleware, serviceProviderController.resetApplication);

    return router;
};
