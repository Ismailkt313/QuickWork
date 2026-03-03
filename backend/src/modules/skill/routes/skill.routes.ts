import { Router } from 'express';
import { SkillController } from '../controllers/skill.controller';

export const createSkillRouter = (controller: SkillController): Router => {
    const router = Router();
    router.get('/', controller.searchSkills);
    return router;
};
