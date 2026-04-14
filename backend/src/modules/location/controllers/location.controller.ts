import { Request, Response } from 'express';
import { ILocationService, ILocationController } from '../interfaces/location.interface';

export class LocationController implements ILocationController {
    private locationService: ILocationService;

    constructor(locationService: ILocationService) {
        this.locationService = locationService;
    }

    getAllLocations = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const result = await this.locationService.getAllLocations();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
