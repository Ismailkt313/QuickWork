import { Router } from 'express';
import { IServiceProviderController } from '../interfaces/serviceProvider.interface';
import { authMiddleware } from '../../../middleware/auth.middleware';

export const createServiceProviderRouter = (serviceProviderController: IServiceProviderController): Router => {
    const router = Router();

    router.post('/apply', authMiddleware, serviceProviderController.submitApplication);
    router.get('/list', serviceProviderController.getProviders);
    router.get('/profile', authMiddleware, serviceProviderController.getMyProfile);
    router.patch('/profile', authMiddleware, serviceProviderController.updateProfile);
    router.get('/:id', serviceProviderController.getProviderById);
    router.post('/reset', authMiddleware, serviceProviderController.resetApplication);

    return router;
};
