import { Request, Response } from 'express';
import { ISkillService } from '../interfaces/skill.interface';
import { ISkillController } from '../interfaces/skill.interface';
// import { success } from 'zod';
import {HttpStatusCode} from "../../../constants/httpStatusCode"


export class SkillController implements ISkillController {
    private skillService: ISkillService;

    constructor(skillService: ISkillService) {
        this.skillService = skillService;
    }

    searchSkills = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const query = (req.query.search as string) || '';
            const result = await this.skillService.searchSkills(query);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    }

    getAllSkills = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const search = req.query.search as string | undefined;
            const locationId = req.query.locationId as string | undefined;
            const result = await this.skillService.getAllSkills(search, locationId);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    }

    getSkills = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const result = await this.skillService.getSkills();
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    }
    myskills = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            console.log('ivida aarelum undoo ', req.user?.userId)
            const userId = req.user?.userId
            // if (!userId) {
            //     res.status(HttpStatusCode.UNAUTH0RIZED).json({success:false,message:'UnAutherized user'})
            // }
            const result = await this.skillService.getMySkills(userId)
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {

        }
    }

}
