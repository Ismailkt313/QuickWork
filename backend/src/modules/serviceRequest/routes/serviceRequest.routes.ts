import { Router } from 'express';
 import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';
import { ROLES } from '../../../constants/roles';
import { IServiceRequestController } from '../interfaces/serviceRequest.interface';

export const createServiceRequestRouter = (controller: IServiceRequestController): Router => {
    const router = Router();

    router.get('/my', authMiddleware, authorizeRoles(ROLES.USER, ROLES.PROVIDER), controller.getUserRequests);
    router.post('/', authMiddleware, authorizeRoles(ROLES.USER, ROLES.PROVIDER), controller.createRequest);

    return router;
};

export const createAdminServiceRequestRouter = (controller: IServiceRequestController): Router => {
    const router = Router();

    router.get('/service-requests', authMiddleware, authorizeRoles(ROLES.ADMIN), controller.getPendingRequests);
    router.patch('/service-request/:id/approve', authMiddleware, authorizeRoles(ROLES.ADMIN), controller.approveRequest);
    router.patch('/service-request/:id/reject', authMiddleware, authorizeRoles(ROLES.ADMIN), controller.rejectRequest);

    return router;
};
