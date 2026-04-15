import { Request, Response, NextFunction } from 'express';
import { ILandingController, ILandingService } from '../types/landing.types';
import {HttpStatusCode} from "../../../constants/httpStatusCode"


export class LandingController implements ILandingController {
    private readonly landingService: ILandingService;

    constructor(landingService: ILandingService) {
        this.landingService = landingService;
    }

    getLandingData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const locationId = req.query.locationId as string | undefined;
            const result = await this.landingService.getLandingData(locationId);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
}
