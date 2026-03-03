import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

export const createLocationRouter = (controller: LocationController): Router => {
    const router = Router();

    router.post('/', authMiddleware, controller.saveLocation);

    return router;
};
