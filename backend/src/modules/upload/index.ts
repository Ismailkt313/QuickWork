import { UploadService } from './services/upload.service';
import { UploadController } from './controllers/upload.controller';
import { createUploadRouter } from './routes/upload.routes';

const uploadService = new UploadService();
const uploadController = new UploadController(uploadService);

export const uploadRouter = createUploadRouter(uploadController);
