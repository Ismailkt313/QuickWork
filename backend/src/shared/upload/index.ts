import { UploadService } from './services/upload.service';
import { UploadController } from './controllers/upload.controller';
import { createUploadRouter } from './routes/upload.routes';
import { S3Service } from './services/s3.service';
import { appLogger } from '../logger';

export const s3Service = new S3Service(appLogger);
export const uploadService = new UploadService(s3Service, appLogger);
const uploadController = new UploadController(uploadService);

export const uploadRouter = createUploadRouter(uploadController);
