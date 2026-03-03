import { Request, Response } from 'express';
import { LocationService } from '../services/location.service';
import { CreateLocationDTO } from '../dtos/createLocation.dto';
import { AppError } from '../../../utils/AppError';

export class LocationController {
    private locationService: LocationService;

    constructor(locationService: LocationService) {
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
}
