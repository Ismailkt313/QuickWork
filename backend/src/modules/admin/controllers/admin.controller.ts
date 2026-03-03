import { Request, Response, NextFunction } from "express";
import { IAdminService, IUserListQuery } from "../interfaces/admin.interface";

export class AdminController {
    private readonly adminService: IAdminService;

    constructor(adminService: IAdminService) {
        this.adminService = adminService;
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
            };

            const result = await this.adminService.getUsers(query);
            res.status(200).json(result);
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
            const result = await this.adminService.toggleBlockUser(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
