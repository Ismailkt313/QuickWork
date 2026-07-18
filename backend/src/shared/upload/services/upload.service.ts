import cloudinary from '../../../config/cloudinary';
import { config } from '../../../config';
import { ErrorMessages } from '../../../constants/messages/errorMessages';
import { IUploadService, IS3Service } from '../interfaces/upload.interface';
import { ILogger } from '../../interfaces/ILogger';
import { randomUUID } from 'crypto';

export class UploadService implements IUploadService {
    private _s3Service: IS3Service;
    private _logger: ILogger;

    constructor(s3Service: IS3Service, logger: ILogger) {
        this._s3Service = s3Service;
        this._logger = logger;
    }

    async uploadProfileImage(fileBuffer: Buffer, _mimetype: string): Promise<{ imageUrl: string, publicId: string }> {
        return new Promise((resolve, reject) => {
            const folder = 'quickwork/profile';
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    transformation: [
                        { width: 150, height: 150, crop: 'fill' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        this._logger.error("Cloudinary Upload Failed", { error: error.message || error, folder });
                        return reject(new Error(ErrorMessages.FILE_UPLOAD_FAILED));
                    }
                    if (result) {
                        this._logger.info("File uploaded to Cloudinary successfully", { publicId: result.public_id, folder });
                        resolve({
                            imageUrl: result.secure_url,
                            publicId: result.public_id
                        });
                    } else {
                        reject(new Error(ErrorMessages.INTERNAL_SERVER_ERROR));
                    }
                }
            ).end(fileBuffer);
        });
    }

    async uploadPortfolioImage(fileBuffer: Buffer, _mimetype: string): Promise<{ imageUrl: string, publicId: string }> {
        return new Promise((resolve, reject) => {
            const folder = 'quickwork/portfolio';
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    transformation: [
                        { width: 800, height: 600, crop: 'limit' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        this._logger.error("Cloudinary Upload Failed", { error: error.message || error, folder });
                        return reject(new Error(ErrorMessages.FILE_UPLOAD_FAILED));
                    }
                    if (result) {
                        this._logger.info("File uploaded to Cloudinary successfully", { publicId: result.public_id, folder });
                        resolve({
                            imageUrl: result.secure_url,
                            publicId: result.public_id
                        });
                    } else {
                        reject(new Error(ErrorMessages.INTERNAL_SERVER_ERROR));
                    }
                }
            ).end(fileBuffer);
        });
    }

    async uploadAssignmentProof(fileBuffer: Buffer, mimetype: string): Promise<{ imageUrl: string, publicId: string }> {
        const fileName = `chat/${randomUUID()}-${Date.now()}`;
        return this._s3Service.uploadFile(fileBuffer, fileName, mimetype);
    }

    async uploadChatMessage(fileBuffer: Buffer, mimetype: string): Promise<{ imageUrl: string, publicId: string }> {
        const fileName = `chat/${randomUUID()}-${Date.now()}`;
        return this._s3Service.uploadFile(fileBuffer, fileName, mimetype);
    }

    async getUploadSignature(folder: string = 'quickwork/general'): Promise<unknown> {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp,
                folder,
            },
            config.CLOUD_API_SECRET
        );

        return {
            signature,
            timestamp,
            cloudName: config.CLOUD_NAME,
            apiKey: config.CLOUD_API_KEY,
            folder,
        };
    }

    async deleteImage(publicId: string): Promise<unknown> {
        if (publicId.startsWith('chat/')) {
            return this._s3Service.deleteFile(publicId);
        }

        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) {
                    this._logger.error("Cloudinary Deletion Failed", { error: error.message || error, publicId });
                    return reject(new Error(ErrorMessages.INTERNAL_SERVER_ERROR));
                }
                resolve(result);
            });
        });
    }
}
