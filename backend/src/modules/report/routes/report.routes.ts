import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';
import { ROLES } from '../../../constants/roles';

export const createReportRouter = (reportController: ReportController): Router => {
    const router = Router();

    
    router.post('/', authMiddleware, reportController.createReport);

    
    router.get('/', authMiddleware, authorizeRoles(ROLES.ADMIN), reportController.getAllReports);
    router.patch('/:id', authMiddleware, authorizeRoles(ROLES.ADMIN), reportController.updateReportStatus);

    return router;
};
