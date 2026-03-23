import { Router } from 'express';
import { ILocationController } from '../interfaces/location.interface';

export const createLocationRouter = (controller: ILocationController): Router => {
    const router = Router();

    router.get('/all', controller.getAllLocations);

    return router;
};
