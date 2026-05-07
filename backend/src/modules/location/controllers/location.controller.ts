import { Request, Response } from 'express';
import { ILocationService, ILocationController } from '../interfaces/location.interface';
import {HttpStatusCode} from "../../../constants/httpStatusCode"

export class LocationController implements ILocationController {
    private _locationService: ILocationService;

    constructor(locationService: ILocationService) {
        this._locationService = locationService;
    }

    getAllLocations = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const result = await this._locationService.getAllLocations();
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
}
