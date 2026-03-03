import { Router } from 'express';
import { ServiceRequestController } from '../controllers/serviceRequest.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';

export const createServiceRequestRouter = (controller: ServiceRequestController): Router => {
    const router = Router();

    router.get('/my', authMiddleware, authorizeRoles('user', 'provider'), controller.getUserRequests);
    router.post('/', authMiddleware, authorizeRoles('user', 'provider'), controller.createRequest);

    return router;
};

export const createAdminServiceRequestRouter = (controller: ServiceRequestController): Router => {
    const router = Router();

    router.get('/service-requests', authMiddleware, authorizeRoles('admin'), controller.getPendingRequests);
    router.patch('/service-request/:id/approve', authMiddleware, authorizeRoles('admin'), controller.approveRequest);
    router.patch('/service-request/:id/reject', authMiddleware, authorizeRoles('admin'), controller.rejectRequest);

    return router;
};
