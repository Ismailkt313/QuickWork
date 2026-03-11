import { Request, Response } from 'express';
import { ISkillService } from '../interfaces/skill.interface';
 import { ISkillController } from '../interfaces/skill.interface';

export class SkillController implements ISkillController {
    private skillService: ISkillService;

    constructor(skillService: ISkillService) {
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
    }

    getAllSkills = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const search = req.query.search as string | undefined;
            const locationId = req.query.locationId as string | undefined;
            const result = await this.skillService.getAllSkills(search, locationId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    getSkills = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const result = await this.skillService.getSkills();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
