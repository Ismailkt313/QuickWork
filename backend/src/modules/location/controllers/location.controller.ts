import { Request, Response } from 'express';
import { CreateLocationDTO } from '../dtos/createLocation.dto';
import { AppError } from '../../../utils/AppError';
import { ILocationService,ILocationController } from '../interfaces/location.interface';

export class LocationController implements ILocationController {
    private locationService: ILocationService;

    constructor(locationService: ILocationService) {
        this.locationService = locationService;
    }

    saveLocation = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', 401);
            }

            const dto = CreateLocationDTO.create(req.body);
            const result = await this.locationService.upsertLocation(dto);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    searchLocations = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const query = (req.query.search as string) || '';
            console.log('Searching locations with query:', query);
            const result = await this.locationService.searchLocations(query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
    getAllLocations = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const result = await this.locationService.getAllLocations();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
