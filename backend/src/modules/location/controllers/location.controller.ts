import { Request, Response, NextFunction } from 'express';
import { ILocationService, ILocationController } from '../interfaces/location.interface';
import {HttpStatusCode} from "../../../constants/httpStatusCode";
import { ApiResponse } from '../../../utils/ApiResponse';

export class LocationController implements ILocationController {
    private _locationService: ILocationService;

    constructor(locationService: ILocationService) {
        this._locationService = locationService;
    }

    public getAllLocations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this._locationService.getAllLocations();
            ApiResponse.sendSuccess(res, result.data, undefined, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    };
}
