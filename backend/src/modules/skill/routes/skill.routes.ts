import { Router } from 'express';
import {ISkillController} from '../interfaces/skill.interface';
export const createSkillRouter = (controller: ISkillController): Router => {
    const router = Router();
    router.get('/', controller.searchSkills);
    router.get('/all', controller.getAllSkills);
    router.get('/list', controller.getSkills);
    return router;
};
