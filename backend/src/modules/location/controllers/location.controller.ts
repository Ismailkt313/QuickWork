import { Request, Response } from 'express';
import { ILocationService, ILocationController } from '../interfaces/location.interface';
import {HttpStatusCode} from "../../../constants/httpStatusCode"


export class LocationController implements ILocationController {
    private locationService: ILocationService;

    constructor(locationService: ILocationService) {
        this.locationService = locationService;
    }

    getAllLocations = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const result = await this.locationService.getAllLocations();
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
}
