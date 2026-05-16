import { Request, Response, NextFunction } from 'express';

export interface IUploadController {
    uploadProfileImage(req: Request, res: Response, next: NextFunction): Promise<void>;
    uploadPortfolioImage(req: Request, res: Response, next: NextFunction): Promise<void>;
    uploadAssignmentProofs(req: Request, res: Response, next: NextFunction): Promise<void>;
    uploadChatMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUploadSignature(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface IUploadService {
    uploadProfileImage(fileBuffer: Buffer, mimetype: string): Promise<{ imageUrl: string, publicId: string }>;
    uploadPortfolioImage(fileBuffer: Buffer, mimetype: string): Promise<{ imageUrl: string, publicId: string }>;
    uploadAssignmentProof(fileBuffer: Buffer, mimetype: string): Promise<{ imageUrl: string, publicId: string }>;
    uploadChatMessage(fileBuffer: Buffer, mimetype: string): Promise<{ imageUrl: string, publicId: string }>;
    getUploadSignature(folder?: string): Promise<unknown>;
    deleteImage(publicId: string): Promise<unknown>;
}

export interface IS3Service {
    uploadFile(fileBuffer: Buffer, fileName: string, mimetype: string): Promise<{ imageUrl: string, publicId: string }>;
    deleteFile(fileName: string): Promise<void>;
}
