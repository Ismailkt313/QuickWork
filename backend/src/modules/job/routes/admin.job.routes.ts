import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';
import { ROLES } from '../../../constants/roles';
import { IJobController } from '../interfaces/job.interface';

export const createAdminJobRouter = (controller: IJobController): Router => {
    const router = Router();

    // Admin Job Management Routes
    router.get('/', authMiddleware, authorizeRoles(ROLES.ADMIN), controller.getAllJobsAdmin);
    router.get('/:jobId', authMiddleware, authorizeRoles(ROLES.ADMIN), controller.getJobDetailsAdmin);
    router.patch('/:jobId/cancel', authMiddleware, authorizeRoles(ROLES.ADMIN), controller.adminCancelJob);
    
    return router;
};
