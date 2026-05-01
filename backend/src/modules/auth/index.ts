import { AuthRepository } from "./repositories/auth.repository";
import { OtpRepository } from "./repositories/otp.repository";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";
import { createAuthRouter } from "./routes/auth.routes";
import { UploadService } from "../upload/services/upload.service";

import { S3Service } from "../upload/services/s3.service";

const authRepository = new AuthRepository();
const otpRepository = new OtpRepository();
const s3Service = new S3Service();
const uploadService = new UploadService(s3Service);

const authService = new AuthService(authRepository, otpRepository, uploadService);
const authController = new AuthController(authService);

const authRouter = createAuthRouter(authController);

export { authRouter };