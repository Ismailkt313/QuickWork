import { Router } from 'express';
import { ISkillController } from '../interfaces/skill.interface';
import { authMiddleware } from '../../../middleware/auth.middleware';
export const createSkillRouter = (controller: ISkillController): Router => {
    const router = Router();
    router.get('/', controller.searchSkills);
    router.get('/all', controller.getAllSkills);
    router.get('/list', controller.getSkills);
    router.get('/my/skills',authMiddleware,controller.myskills)
    return router;
};