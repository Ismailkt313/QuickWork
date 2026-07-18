import { Request, Response, NextFunction } from 'express';
import { IUploadController, IUploadService } from '../interfaces/upload.interface';
import { AppError } from '../../../utils/AppError';
import { HttpStatusCode } from "../../../constants/httpStatusCode";
import { ErrorMessages } from '../../../constants/messages/errorMessages';

export class UploadController implements IUploadController {
    private _uploadService: IUploadService;

    constructor(uploadService: IUploadService) {
        this._uploadService = uploadService;
    }

    public uploadProfileImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.file) {
                throw new AppError(ErrorMessages.NO_IMAGE_PROVIDED, HttpStatusCode.BAD_REQUEST);
            }

            const result = await this._uploadService.uploadProfileImage(req.file.buffer, req.file.mimetype);

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    public uploadPortfolioImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.file) {
                throw new AppError(ErrorMessages.NO_IMAGE_PROVIDED, HttpStatusCode.BAD_REQUEST);
            }

            const result = await this._uploadService.uploadPortfolioImage(req.file.buffer, req.file.mimetype);

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    public uploadAssignmentProofs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const files = req.files as Express.Multer.File[];
            if (!files || files.length === 0) {
                throw new AppError(ErrorMessages.NO_IMAGES_PROVIDED, HttpStatusCode.BAD_REQUEST);
            }

            const uploadPromises = files.map(file =>
                this._uploadService.uploadAssignmentProof(file.buffer, file.mimetype)
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

    public uploadChatMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.file) {
                throw new AppError(ErrorMessages.NO_IMAGE_PROVIDED, HttpStatusCode.BAD_REQUEST);
            }

            const result = await this._uploadService.uploadChatMessage(req.file.buffer, req.file.mimetype);

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    public getUploadSignature = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const folder = req.query.folder as string || 'quickwork/general';
            const signatureData = await this._uploadService.getUploadSignature(folder);

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: signatureData
            });
        } catch (error) {
            next(error);
        }
    };
}
