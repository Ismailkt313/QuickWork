import { AuthRepository } from "./repositories/auth.repository";
import { OtpRepository } from "./repositories/otp.repository";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";
import { createAuthRouter } from "./routes/auth.routes";
import { UploadService } from "../upload/services/upload.service";

const authRepository = new AuthRepository();
const otpRepository = new OtpRepository();
const uploadService = new UploadService();
const authService = new AuthService(authRepository, otpRepository, uploadService);
const authController = new AuthController(authService);

const authRouter = createAuthRouter(authController);

export { authRouter };