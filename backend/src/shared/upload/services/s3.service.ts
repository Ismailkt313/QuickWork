import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../../../config";
import { ILogger } from '../../interfaces/ILogger';
import { IS3Service } from '../interfaces/upload.interface';

export class S3Service implements IS3Service {
    private _s3Client: S3Client;
    private _logger: ILogger;

    constructor(logger: ILogger) {
        this._logger = logger;
        this._logger.info("S3 Config Check", {
            region: config.AWS_REGION,
            bucket: config.AWS_BUCKET_NAME,
            hasAccessKey: !!config.AWS_ACCESS_KEY_ID,
            hasSecretKey: !!config.AWS_SECRET_ACCESS_KEY
        });

        this._s3Client = new S3Client({
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

            await this._s3Client.send(command);

            const imageUrl = `https://${config.AWS_BUCKET_NAME}.s3.${config.AWS_REGION}.amazonaws.com/${fileName}`;

            this._logger.info("File uploaded to S3 successfully", { bucket: config.AWS_BUCKET_NAME, fileName });

            return {
                imageUrl,
                publicId: fileName,
            };
        } catch (error: unknown) {
            const err = error as { message?: string; code?: string };
            this._logger.error("S3 Upload Failed", {
                message: err.message,
                code: err.code,
                bucket: config.AWS_BUCKET_NAME
            });
            throw new Error(`S3 Upload Error: ${err.message || 'Unknown error'}`);
        }

    }

    async deleteFile(fileName: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: config.AWS_BUCKET_NAME,
                Key: fileName,
            });

            await this._s3Client.send(command);
            this._logger.info("File deleted from S3 successfully", { bucket: config.AWS_BUCKET_NAME, fileName });
        } catch (error: any) {
            this._logger.error("S3 Deletion Failed", { error: error?.message, stack: error?.stack, bucket: config.AWS_BUCKET_NAME, fileName });
            throw error;
        }
    }
}
