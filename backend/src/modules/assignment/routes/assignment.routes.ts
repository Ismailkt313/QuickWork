import { Router } from 'express';
import { IAssignmentController } from '../interfaces/assignment.interface';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';
import { ROLES } from '../../admin/interfaces/admin.interface';

export function createAssignmentRouter(controller: IAssignmentController): Router {
  const router = Router();

  router.get('/my', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.getProviderAssignments);
  router.get('/:id', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.getAssignmentById);
  router.patch('/:id/status', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.updateStatus);
  router.post('/:id/proof', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.submitProof);

  return router;
}
