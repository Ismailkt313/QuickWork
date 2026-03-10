import { AuthRepository } from "./repositories/auth.repository";
import { OtpRepository } from "./repositories/otp.repository";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";
import { createAuthRouter } from "./routes/auth.routes";

const authRepository = new AuthRepository();
const otpRepository = new OtpRepository();
const authService = new AuthService(authRepository, otpRepository);
const authController = new AuthController(authService);

const authRouter = createAuthRouter(authController);

export { authRouter };