import { Request, Response, NextFunction } from 'express';
import { IServiceProviderController, IServiceProviderService, IServiceProvider } from '../interfaces/serviceProvider.interface';
import { SubmitApplicationDTO } from '../dtos/submitApplication.dto';
import { AppError } from '../../../utils/AppError';
import { mapProviderToResponseDTO } from '../dtos/providerResponse.dto';
import { UpdateProviderDTO } from '../dtos/updateProvider.dto';
import { HttpStatusCode } from "../../../constants/httpStatusCode"
import { ErrorMessages } from "../../../constants/messages/errorMessages";

export class ServiceProviderController implements IServiceProviderController {
    private _serviceProviderService: IServiceProviderService;

    constructor(serviceProviderService: IServiceProviderService) {
        this._serviceProviderService = serviceProviderService;
    }

    public submitApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);
            }

            const applicationData = SubmitApplicationDTO.create(req.body);

            const result = await this._serviceProviderService.submitApplication(userId, applicationData);

            if (!result.success) {
                throw new AppError(result.message || 'Conflict occurred', HttpStatusCode.CONFLICT);
            }

            res.status(HttpStatusCode.CREATED).json(result);
        } catch (error) {
            next(error);
        }
    };

    public getProviders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { skillId, locationId, page, limit, search, sort } = req.query as Record<string, string | undefined>;
            const currentUserId = req.user?.userId;

            const result = await this._serviceProviderService.getProviders({
                skillId,
                locationId,
                page: Number(page),
                limit: Number(limit),
                search,
                sort,
                currentUserId
            });

            if (!result.success) {
                res.status(HttpStatusCode.BAD_REQUEST).json(result);
                return;
            }

            const { providers, total, page: pg, limit: lm } = result.data!;

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: providers,
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

    public getProviderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const result = await this._serviceProviderService.getProviderById(id);

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

    public getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(HttpStatusCode.UNAUTH0RIZED).json({ success: false, message: ErrorMessages.UNAUTHORIZED });
                return;
            }

            const result = await this._serviceProviderService.getMyProfile(userId);
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

    public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(HttpStatusCode.UNAUTH0RIZED).json({ success: false, message: ErrorMessages.UNAUTHORIZED });
                return;
            }

            const updateData = UpdateProviderDTO.create(req.body);
            const result = await this._serviceProviderService.updateProfile(userId, updateData as unknown as Partial<IServiceProvider>);

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

    public resetApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(HttpStatusCode.UNAUTH0RIZED).json({ success: false, message: ErrorMessages.UNAUTHORIZED });
                return;
            }

            const result = await this._serviceProviderService.resetApplication(userId);
            if (!result.success) {
                res.status(HttpStatusCode.BAD_REQUEST).json(result);
                return;
            }

            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public updateAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);

            const { availability } = req.body;
            const result = await this._serviceProviderService.updateAvailability(userId, availability);

            if (!result.success) throw new AppError(result.message, HttpStatusCode.BAD_REQUEST);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public addBlockedDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);

            const { startDate, endDate, reason } = req.body;
            const result = await this._serviceProviderService.addBlockedDate(userId, { startDate, endDate, reason });

            if (!result.success) throw new AppError(result.message, HttpStatusCode.BAD_REQUEST);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public deleteBlockedDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);

            const { id } = req.params;
            const result = await this._serviceProviderService.deleteBlockedDate(userId, id as string);

            if (!result.success) throw new AppError(result.message, HttpStatusCode.BAD_REQUEST);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
}


