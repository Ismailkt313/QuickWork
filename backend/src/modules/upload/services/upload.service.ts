import cloudinary from '../../../config/cloudinary';

export class UploadService {
    async uploadProfileImage(fileBuffer: Buffer, mimetype: string): Promise<{ imageUrl: string, publicId: string }> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'quickwork/profile-images',
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
}
