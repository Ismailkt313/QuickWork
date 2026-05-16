import { Request, Response, NextFunction } from 'express';
import { ISkillService } from '../interfaces/skill.interface';
import { ISkillController } from '../interfaces/skill.interface';
import {HttpStatusCode} from "../../../constants/httpStatusCode"
import { AppError } from '../../../utils/AppError';
import { ErrorMessages } from '../../../constants/messages/errorMessages';

export class SkillController implements ISkillController {
    private _skillService: ISkillService;

    constructor(skillService: ISkillService) {
        this._skillService = skillService;
    }

    searchSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const query = (req.query.search as string) || '';
            const result = await this._skillService.searchSkills(query);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    }

    getAllSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 24;
            const search = req.query.search as string | undefined;
            const locationId = req.query.locationId as string | undefined;
            const result = await this._skillService.getAllSkills(page, limit, search, locationId);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    }

    getAdminSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || undefined;
            const result = await this._skillService.getAdminSkills(page, limit, search);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    }

    createSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this._skillService.createSkill(req.body);
            const status = result.success ? HttpStatusCode.CREATED : HttpStatusCode.BAD_REQUEST;
            res.status(status).json(result);
        } catch (error) {
            next(error);
        }
    }

    updateSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const result = await this._skillService.updateSkill(id, req.body);
            const status = result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST;
            res.status(status).json(result);
        } catch (error) {
            next(error);
        }
    }

    deleteSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const result = await this._skillService.deleteSkill(id);
            const status = result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST;
            res.status(status).json(result);
        } catch (error) {
            next(error);
        }
    }

    toggleSkillStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const result = await this._skillService.toggleSkillStatus(id);
            const status = result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST;
            res.status(status).json(result);
        } catch (error) {
            next(error);
        }
    }

    getSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this._skillService.getSkills();
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    }
    myskills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
            }
            const result = await this._skillService.getMySkills(userId)
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            next(error);
        }
    }

}
