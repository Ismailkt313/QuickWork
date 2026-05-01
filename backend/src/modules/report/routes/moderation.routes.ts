import { Router } from 'express';
import { ModerationController } from '../controllers/moderation.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';
import { ROLES } from '../../../constants/roles';

export const createModerationRouter = (moderationController: ModerationController): Router => {
    const router = Router();

    
    router.get('/', authMiddleware, authorizeRoles(ROLES.ADMIN), moderationController.getReports);
    router.get('/:id', authMiddleware, authorizeRoles(ROLES.ADMIN), moderationController.getReportDetail);
    router.post('/:id/action', authMiddleware, authorizeRoles(ROLES.ADMIN), moderationController.takeAction);

    return router;
};
