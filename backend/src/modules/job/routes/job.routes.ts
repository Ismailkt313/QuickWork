import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';
import { ROLES } from '../../admin/interfaces/admin.interface';
import { IJobController } from '../interfaces/job.interface';

export const createJobRouter = (controller: IJobController): Router => {
    const router = Router();

    router.post('/', authMiddleware, authorizeRoles(ROLES.USER,ROLES.PROVIDER), controller.createJob);
    router.get('/my', authMiddleware, authorizeRoles(ROLES.USER), controller.getUserJobs);
    router.get('/availablejobs', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.getAllOpenJobs);

    return router;
};
