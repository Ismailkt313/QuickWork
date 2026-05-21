import { Router } from 'express';
import { ISkillController } from '../interfaces/skill.interface';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorizeRoles } from '../../../middleware/role.middleware';
import { ROLES } from '../../../constants/roles';

export const createSkillRouter = (controller: ISkillController): Router => {
    const router = Router();
    
    // Public/User routes
    router.get('/', controller.searchSkills);
    router.get('/all', controller.getAllSkills);
    router.get('/list', controller.getSkills);
    router.get('/my/skills', authMiddleware, controller.mySkills);

    // Admin routes
    router.get('/admin/list', authMiddleware, authorizeRoles(ROLES.ADMIN), controller.getAdminSkills);
    router.post('/admin/create', authMiddleware, authorizeRoles(ROLES.ADMIN), controller.createSkill);
    router.put('/admin/update/:id', authMiddleware, authorizeRoles(ROLES.ADMIN), controller.updateSkill);
    router.delete('/admin/delete/:id', authMiddleware, authorizeRoles(ROLES.ADMIN), controller.deleteSkill);
    router.patch('/admin/toggle-status/:id', authMiddleware, authorizeRoles(ROLES.ADMIN), controller.toggleSkillStatus);

    return router;
};