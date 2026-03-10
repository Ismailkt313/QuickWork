import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import { AppError } from '../../../utils/AppError';

export class UploadController {
    private uploadService: UploadService;

    constructor(uploadService: UploadService) {
        this.uploadService = uploadService;
    }

    uploadProfileImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.file) {
                throw new AppError('No image file provided', 400);
            }

            const result = await this.uploadService.uploadProfileImage(req.file.buffer, req.file.mimetype);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    uploadPortfolioImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.file) {
                throw new AppError('No image file provided', 400);
            }

            const result = await this.uploadService.uploadPortfolioImage(req.file.buffer, req.file.mimetype);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };
}
