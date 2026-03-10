import { Router } from 'express';
import { IServiceProviderController } from '../interfaces/serviceProvider.interface';
import { authMiddleware } from '../../../middleware/auth.middleware';

export const createServiceProviderRouter = (serviceProviderController: IServiceProviderController): Router => {
    const router = Router();

    router.post('/apply', authMiddleware, serviceProviderController.submitApplication);
    router.get('/list', serviceProviderController.getProviders);
    router.get('/:id', serviceProviderController.getProviderById);

    return router;
};
