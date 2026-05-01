import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../../../config";
import { logger } from "../../../utils/logger";
import { IS3Service } from '../interfaces/upload.interface';

export class S3Service implements IS3Service {
    private s3Client: S3Client;

    constructor() {
        
        logger.info({ 
            region: config.AWS_REGION, 
            bucket: config.AWS_BUCKET_NAME,
            hasAccessKey: !!config.AWS_ACCESS_KEY_ID,
            hasSecretKey: !!config.AWS_SECRET_ACCESS_KEY
        }, "S3 Config Check");


        this.s3Client = new S3Client({
            region: config.AWS_REGION,
            credentials: {
                accessKeyId: config.AWS_ACCESS_KEY_ID,
                secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
            },
        });
    }


    async uploadFile(fileBuffer: Buffer, fileName: string, mimetype: string): Promise<{ imageUrl: string, publicId: string }> {
        try {
            const command = new PutObjectCommand({
                Bucket: config.AWS_BUCKET_NAME,
                Key: fileName,
                Body: fileBuffer,
                ContentType: mimetype,
            });

            await this.s3Client.send(command);

            const imageUrl = `https://${config.AWS_BUCKET_NAME}.s3.${config.AWS_REGION}.amazonaws.com/${fileName}`;

            
            logger.info({ bucket: config.AWS_BUCKET_NAME, fileName }, "File uploaded to S3 successfully");

            return {
                imageUrl,
                publicId: fileName,
            };
        } catch (error: any) {
            logger.error({ 
                message: error.message, 
                code: error.code, 
                bucket: config.AWS_BUCKET_NAME 
            }, "S3 Upload Failed");
            throw new Error(`S3 Upload Error: ${error.message}`);
        }

    }

    async deleteFile(fileName: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: config.AWS_BUCKET_NAME,
                Key: fileName,
            });

            await this.s3Client.send(command);
            logger.info({ bucket: config.AWS_BUCKET_NAME, fileName }, "File deleted from S3 successfully");
        } catch (error) {
            logger.error({ error, bucket: config.AWS_BUCKET_NAME, fileName }, "S3 Deletion Failed");
            throw error;
        }
    }
}
