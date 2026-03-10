import { Router } from 'express';
import { ILocationController } from '../interfaces/location.interface';
import { authMiddleware } from '../../../middleware/auth.middleware';

export const createLocationRouter = (controller: ILocationController): Router => {
    const router = Router();

    router.get('/', controller.searchLocations);
    router.post('/', authMiddleware, controller.saveLocation);
    router.get('/all', controller.getAllLocations);

    return router;
};
