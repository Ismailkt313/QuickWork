import { Request, Response } from 'express';
import { ServiceProviderService } from '../services/serviceProvider.service';
import { SubmitApplicationDTO } from '../dtos/submitApplication.dto';
import { AppError } from '../../../utils/AppError';

export class ServiceProviderController {
    private serviceProviderService: ServiceProviderService;

    constructor(serviceProviderService: ServiceProviderService) {
        this.serviceProviderService = serviceProviderService;
    }

    submitApplication = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                throw new AppError('Unauthorized access', 401);
            }

            const applicationData = SubmitApplicationDTO.create(req.body);

            const result = await this.serviceProviderService.submitApplication(userId, applicationData);

            if (!result.success) {
                throw new AppError(result.message || 'Conflict occurred', 409);
            }

            res.status(201).json(result);
        } catch (error: any) {
            next(error);
        }
    };
}
