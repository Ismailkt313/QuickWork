import { Request, Response, NextFunction } from 'express';
import { IServiceProviderController, IServiceProviderService } from '../interfaces/serviceProvider.interface';
import { SubmitApplicationDTO } from '../dtos/submitApplication.dto';
import { AppError } from '../../../utils/AppError';
import { mapProviderToResponseDTO } from '../dtos/providerResponse.dto';
import { UpdateProviderDTO } from '../dtos/updateProvider.dto';
import { HttpStatusCode } from "../../../constants/httpStatusCode"
import { SuccessMessages } from "../../../constants/messages/successMessages";
import { ErrorMessages } from "../../../constants/messages/errorMessages";


export class ServiceProviderController implements IServiceProviderController {
    private serviceProviderService: IServiceProviderService;

    constructor(serviceProviderService: IServiceProviderService) {
        this.serviceProviderService = serviceProviderService;
    }

    submitApplication = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
            }

            const applicationData = SubmitApplicationDTO.create(req.body);

            const result = await this.serviceProviderService.submitApplication(userId, applicationData);

            if (!result.success) {
                throw new AppError(result.message || 'Conflict occurred', HttpStatusCode.CONFLICT);
            }

            res.status(HttpStatusCode.CREATED).json(result);
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

            if (!result.success) {
                res.status(HttpStatusCode.BAD_REQUEST).json(result);
                return;
            }

            const { providers, total, page: pg, limit: lm } = result.data!;

            res.status(HttpStatusCode.OK).json({
                success: true,
                providers: providers,
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
                res.status(HttpStatusCode.NOT_FOUND).json(result);
                return;
            }

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: result.data ? mapProviderToResponseDTO(result.data) : null
            });
        } catch (error) {
            next(error);
        }
    };

    getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(HttpStatusCode.UNAUTH0RIZED).json({ success: false, message: ErrorMessages.UNAUTHORIZED });
                return;
            }

            const result = await this.serviceProviderService.getMyProfile(userId);
            if (!result.success) {
                res.status(HttpStatusCode.NOT_FOUND).json(result);
                return;
            }

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: result.data ? mapProviderToResponseDTO(result.data) : null
            });
        } catch (error) {
            next(error);
        }
    };

    updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(HttpStatusCode.UNAUTH0RIZED).json({ success: false, message: ErrorMessages.UNAUTHORIZED });
                return;
            }

            const updateData = UpdateProviderDTO.create(req.body);
            const result = await this.serviceProviderService.updateProfile(userId, updateData);

            if (!result.success) {
                res.status(HttpStatusCode.BAD_REQUEST).json(result);
                return;
            }

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: result.message,
                data: result.data ? mapProviderToResponseDTO(result.data) : null
            });
        } catch (error) {
            next(error);
        }
    };

    resetApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(HttpStatusCode.UNAUTH0RIZED).json({ success: false, message: ErrorMessages.UNAUTHORIZED });
                return;
            }

            const result = await this.serviceProviderService.resetApplication(userId);
            if (!result.success) {
                res.status(HttpStatusCode.BAD_REQUEST).json(result);
                return;
            }

            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
}

