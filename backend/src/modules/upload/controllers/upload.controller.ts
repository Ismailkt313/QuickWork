import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import { AppError } from '../../../utils/AppError';
import {HttpStatusCode} from "../../../constants/httpStatusCode"


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

            res.status(HttpStatusCode.OK).json({
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

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    uploadAssignmentProofs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const files = req.files as Express.Multer.File[];
            if (!files || files.length === 0) {
                throw new AppError('No image files provided', 400);
            }

            const uploadPromises = files.map(file => 
                this.uploadService.uploadAssignmentProof(file.buffer, file.mimetype)
            );

            const results = await Promise.all(uploadPromises);

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: results.map(r => ({ imageUrl: r.imageUrl, publicId: r.publicId }))
            });
        } catch (error) {
            next(error);
        }
    };

    getUploadSignature = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const folder = req.query.folder as string || 'quickwork/general';
            const signatureData = await this.uploadService.getUploadSignature(folder);

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: signatureData
            });
        } catch (error) {
            next(error);
        }
    };
}
