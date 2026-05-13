import { Request, Response, NextFunction } from "express";
import { IAdminController, IAdminService, IUserListQuery } from "../interfaces/admin.interface";
import { HttpStatusCode } from "../../../constants/httpStatusCode";
import { ErrorMessages } from "../../../constants/messages/errorMessages";

export class AdminController implements IAdminController {
    private readonly _adminService: IAdminService;

    constructor(adminService: IAdminService) {
        this._adminService = adminService;
    }

    public getUsers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const query: IUserListQuery = {
                page: Math.max(1, parseInt(req.query.page as string) || 1),
                limit: Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10)),
                search: (req.query.search as string) || undefined,
                role: (req.query.role as string) || undefined,
                isBlocked: req.query.isBlocked === 'true' ? true : req.query.isBlocked === 'false' ? false : undefined,
            };

            const result = await this._adminService.getUsers(query);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public toggleBlockUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.params.id as string;
            const result = await this._adminService.toggleBlockUser(id);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public getPendingProviders = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const query: IUserListQuery = {
                page: Math.max(1, parseInt(req.query.page as string) || 1),
                limit: Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10)),
            };
            const result = await this._adminService.getPendingProviders(query);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public approveProvider = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.params.id as string;
            const result = await this._adminService.approveProvider(id);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public rejectProvider = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.params.id as string;
            const { reason } = req.body;

            if (!reason || typeof reason !== 'string' || reason.trim() === '') {
                res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: ErrorMessages.VALIDATION_FAILED });
                return;
            }

            const result = await this._adminService.rejectProvider(id, reason.trim());
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
    public getProviderDetails = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.params.id as string;
            const result = await this._adminService.getProviderDetails(id);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public getUserById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.params.id as string;
            const result = await this._adminService.getUserById(id);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
}
