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

  
  router.post('/:id/payment/mark-as-paid-cash', authMiddleware, authorizeRoles(ROLES.USER,ROLES.PROVIDER), controller.markAsPaidByCash);
  router.post('/:id/payment/confirm-cash', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.confirmPayment);
  router.post('/:id/payment/provider-mark-paid', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.providerMarkAsPaid);
  router.post('/:id/payment/reject', authMiddleware, authorizeRoles(ROLES.PROVIDER), controller.rejectPayment);

  return router;
}
