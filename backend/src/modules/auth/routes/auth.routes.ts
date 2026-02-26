import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

export const createAuthRouter = (authController: AuthController): Router => {
    const router = Router();

    router.post("/send-otp", authController.sendOtp);
    router.post("/verify-otp", authController.verifyOtp);
    router.post("/resend-otp", authController.resendOtp);
    router.post("/login", authController.login);
    router.post("/refresh-token", authController.refreshToken);

    return router;
};
