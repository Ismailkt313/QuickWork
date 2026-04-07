import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';
import { ROLES } from '../../../constants/roles';
import { IJobController } from '../interfaces/job.interface';

export const createJobRouter = (controller: IJobController): Router => {
    const router = Router();

    router.post('/', authMiddleware, authorizeRoles(ROLES.USER, ROLES.PROVIDER), controller.createJob);
    router.get('/my', authMiddleware, authorizeRoles(ROLES.USER,ROLES.PROVIDER), controller.getUserJobs);
    router.get('/offers', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.getDirectOffers);
    router.put('/offers/:jobId/accept', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.acceptOffer);
    router.put('/offers/:jobId/reject', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.rejectOffer);
    router.get('/availablejobs', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.availableJobs);
    router.post('/:jobId/accept', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.acceptJob);
    router.put('/:jobId/cancel', authMiddleware, authorizeRoles(ROLES.USER, ROLES.PROVIDER), controller.cancelJob);
    router.get('/:jobId', authMiddleware, controller.getJobById);
    router.get('/:jobId/assignments', authMiddleware, controller.getJobAssignments);

    return router;
};
