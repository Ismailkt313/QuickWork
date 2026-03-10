import { Request, Response, NextFunction } from 'express';
import { IServiceProviderController, IServiceProviderService } from '../interfaces/serviceProvider.interface';
import { SubmitApplicationDTO } from '../dtos/submitApplication.dto';
import { AppError } from '../../../utils/AppError';

export class ServiceProviderController implements IServiceProviderController {
    private serviceProviderService: IServiceProviderService;

    constructor(serviceProviderService: IServiceProviderService) {
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

    getProviders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { skillId, locationId, page, limit } = req.query as Record<string, string | undefined>;

            const result = await this.serviceProviderService.getProviders({
                skillId,
                locationId,
                page: Number(page),
                limit: Number(limit),
            });
            console.log(result)
            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            const { providers, total, page: pg, limit: lm } = result.data!;

            res.status(200).json({
                success: true,
                providers,
                pagination: {
                    page: pg,
                    limit: lm,
                    total,
                    totalPages: Math.ceil(total / lm),
                    hasNext: pg * lm < total,
                    hasPrev: pg > 1,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    getProviderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const result = await this.serviceProviderService.getProviderById(id);

            if (!result.success) {
                res.status(404).json(result);
                return;
            }

            res.status(200).json({ success: true, data: result.data });
        } catch (error) {
            next(error);
        }
    };
}
