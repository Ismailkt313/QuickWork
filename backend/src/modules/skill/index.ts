import { SkillRepository } from './repositories/skill.repository';
import { SkillService } from './services/skill.service';
import { SkillController } from './controllers/skill.controller';
import { createSkillRouter } from './routes/skill.routes';

export const skillRepository = new SkillRepository();
export const skillService = new SkillService(skillRepository);
const skillController = new SkillController(skillService);

export const skillRouter = createSkillRouter(skillController);
