import { Router } from 'express';
import { ServiceProviderController } from '../controllers/serviceProvider.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

export const createServiceProviderRouter = (serviceProviderController: ServiceProviderController): Router => {
    const router = Router();

    router.post('/apply', authMiddleware, serviceProviderController.submitApplication);

    return router;
};
