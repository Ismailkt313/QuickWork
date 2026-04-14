import cloudinary from '../../../config/cloudinary';
import { config } from '../../../config';

export class UploadService {
    async uploadProfileImage(fileBuffer: Buffer, mimetype: string): Promise<{ imageUrl: string, publicId: string }> {
        return this.uploadImage(fileBuffer, 'quickwork/profile-images');
    }

    async uploadPortfolioImage(fileBuffer: Buffer, mimetype: string): Promise<{ imageUrl: string, publicId: string }> {
        return this.uploadImage(fileBuffer, 'quickwork/portfolio-images');
    }

    async uploadAssignmentProof(fileBuffer: Buffer, mimetype: string): Promise<{ imageUrl: string, publicId: string }> {
        return this.uploadImage(fileBuffer, 'quickwork/assignment-proofs');
    }

    private uploadImage(fileBuffer: Buffer, folder: string): Promise<{ imageUrl: string, publicId: string }> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) {
                        return reject(new Error('Failed to upload image to Cloudinary'));
                    }
                    if (result) {
                        resolve({
                            imageUrl: result.secure_url,
                            publicId: result.public_id
                        });
                    } else {
                        reject(new Error('Cloudinary returned no result'));
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

    async deleteImage(publicId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) {
                    return reject(new Error('Failed to delete image from Cloudinary'));
                }
                resolve(result);
            });
        });
    }
}
