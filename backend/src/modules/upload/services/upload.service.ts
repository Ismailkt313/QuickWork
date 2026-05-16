import cloudinary from '../../../config/cloudinary';
import { config } from '../../../config';
import { ErrorMessages } from '../../../constants/messages/errorMessages';
import { logger } from '../../../utils/logger';
import { randomUUID } from 'crypto';
import { IUploadService, IS3Service } from '../interfaces/upload.interface';

export class UploadService implements IUploadService {
    private _s3Service: IS3Service;

    constructor(s3Service: IS3Service) {
        this._s3Service = s3Service;
    }

    async uploadProfileImage(fileBuffer: Buffer, _mimetype: string): Promise<{ imageUrl: string, publicId: string }> {
        return this._uploadImage(fileBuffer, 'quickwork/profile-images');
    }

    async uploadPortfolioImage(fileBuffer: Buffer, _mimetype: string): Promise<{ imageUrl: string, publicId: string }> {
        return this._uploadImage(fileBuffer, 'quickwork/portfolio-images');
    }

    async uploadAssignmentProof(fileBuffer: Buffer, _mimetype: string): Promise<{ imageUrl: string, publicId: string }> {
        return this._uploadImage(fileBuffer, 'quickwork/assignment-proofs');
    }

    async uploadChatMessage(fileBuffer: Buffer, mimetype: string): Promise<{ imageUrl: string, publicId: string }> {
        if (!config.AWS_ACCESS_KEY_ID || !config.AWS_SECRET_ACCESS_KEY || !config.AWS_BUCKET_NAME) {
            return this._uploadImage(fileBuffer, 'quickwork/chat-images');
        }
        const fileName = `chat/${randomUUID()}-${Date.now()}`;
        return this._s3Service.uploadFile(fileBuffer, fileName, mimetype);
    }

    private _uploadImage(fileBuffer: Buffer, folder: string): Promise<{ imageUrl: string, publicId: string }> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) {
                        logger.error({ error, folder }, "Cloudinary Upload Failed");
                        return reject(new Error(ErrorMessages.FILE_UPLOAD_FAILED));
                    }
                    if (result) {
                        logger.info({ publicId: result.public_id, folder }, "File uploaded to Cloudinary successfully");
                        resolve({
                            imageUrl: result.secure_url,
                            publicId: result.public_id
                        });
                    } else {
                        reject(new Error(ErrorMessages.INTERNAL_SERVER_ERROR));
                    }
                }
            );

            uploadStream.end(fileBuffer);
        });
    }

    async getUploadSignature(folder: string = 'quickwork/general') {
        const timestamp = Math.round(new Date().getTime() / 1000);

        const paramsToSign = {
            timestamp,
            folder,
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            config.CLOUD_API_SECRET
        );

        return {
            signature,
            timestamp,
            apiKey: config.CLOUD_API_KEY,
            cloudName: config.CLOUD_NAME,
            folder
        };
    }

    async deleteImage(publicId: string): Promise<unknown> {

        if (publicId.includes('/') && !publicId.startsWith('quickwork')) {
            return this._s3Service.deleteFile(publicId);
        }

        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) {
                    logger.error({ error, publicId }, "Cloudinary Deletion Failed");
                    return reject(new Error(ErrorMessages.INTERNAL_SERVER_ERROR));
                }
                resolve(result);
            });
        });
    }
}

