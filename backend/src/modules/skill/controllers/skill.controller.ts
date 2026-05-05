import { Request, Response } from 'express';
import { ISkillService } from '../interfaces/skill.interface';
import { ISkillController } from '../interfaces/skill.interface';
import {HttpStatusCode} from "../../../constants/httpStatusCode"


export class SkillController implements ISkillController {
    private _skillService: ISkillService;

    constructor(skillService: ISkillService) {
        this._skillService = skillService;
    }

    searchSkills = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const query = (req.query.search as string) || '';
            const result = await this._skillService.searchSkills(query);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    }

    getAllSkills = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const search = req.query.search as string | undefined;
            const locationId = req.query.locationId as string | undefined;
            const result = await this._skillService.getAllSkills(search, locationId);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    }

    getSkills = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const result = await this._skillService.getSkills();
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    }
    myskills = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId
            const result = await this._skillService.getMySkills(userId)
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            next(error);
        }
    }

}
