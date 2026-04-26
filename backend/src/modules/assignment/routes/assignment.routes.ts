import { Router } from 'express';
import { IAssignmentController } from '../interfaces/assignment.interface';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';
import { ROLES } from '../../../constants/roles';

export function createAssignmentRouter(controller: IAssignmentController): Router {
  const router = Router();

  router.get('/my', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.getProviderAssignments);
  router.get('/:id', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.getAssignmentById);
  router.patch('/:id/status', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.updateStatus);
  router.post('/:id/proof', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.submitProof);
  
  router.post('/:id/cancel-by-provider', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.cancelByProvider);
  router.post('/:id/cancel-by-client', authMiddleware, authorizeRoles(ROLES.USER,ROLES.PROVIDER), controller.cancelByClient);
  router.post('/:id/absence', authMiddleware, authorizeRoles(ROLES.USER,ROLES.PROVIDER), controller.reportAbsence);

  return router;
}
