import { AuthRepository } from "./repositories/auth.repository";
import { OtpRepository } from "./repositories/otp.repository";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";
import { createAuthRouter } from "./routes/auth.routes";
import { uploadService } from "../../shared/upload";
import { appLogger } from "../../shared/logger";

export const authRepository = new AuthRepository();
export const otpRepository = new OtpRepository();

export const authService = new AuthService(authRepository, otpRepository, uploadService, appLogger);
const authController = new AuthController(authService);

export const authRouter = createAuthRouter(authController);