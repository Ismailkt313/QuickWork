import { UploadService } from './services/upload.service';
import { UploadController } from './controllers/upload.controller';
import { createUploadRouter } from './routes/upload.routes';

import { S3Service } from './services/s3.service';

const s3Service = new S3Service();
const uploadService = new UploadService(s3Service);
const uploadController = new UploadController(uploadService);

export const uploadRouter = createUploadRouter(uploadController);
