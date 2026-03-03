import { Request, Response } from 'express';
import { SkillService } from '../services/skill.service';

export class SkillController {
    private skillService: SkillService;

    constructor(skillService: SkillService) {
        this.skillService = skillService;
    }

    searchSkills = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const query = (req.query.search as string) || '';
            const result = await this.skillService.searchSkills(query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
