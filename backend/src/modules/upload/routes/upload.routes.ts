import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { AppError } from '../../../utils/AppError';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new AppError('Invalid file type. Only images are allowed', 400));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024,
    }
});

export const createUploadRouter = (controller: UploadController): Router => {
    const router = Router();

    router.post(
        '/profile-image',
        authMiddleware,
        upload.single('image'),
        controller.uploadProfileImage
    );

    router.post(
        '/portfolio-image',
        authMiddleware,
        upload.single('image'),
        controller.uploadPortfolioImage
    );
    
    router.post(
        '/assignment-proof',
        authMiddleware,
        upload.array('images', 5),
        controller.uploadAssignmentProofs
    );

    return router;
};
