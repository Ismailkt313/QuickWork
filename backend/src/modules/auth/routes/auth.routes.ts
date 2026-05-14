import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import passport from "../../../config/passport";
import { config } from "../../../config";
import { authMiddleware } from "../../../middleware/auth.middleware";

export const createAuthRouter = (authController: AuthController): Router => {
    const router = Router();

    router.post("/send-otp", authController.sendOtp);
    router.post("/verify-otp", authController.verifyOtp);
    router.post("/resend-otp", authController.resendOtp);
    router.post("/login", authController.login);
    router.post("/refresh-token", authController.refreshToken);
    router.post('/admin/login', authController.adminLogin);
    router.post('/logout', authController.logout);
    router.post("/forgot-password", authController.forgotPassword);
    router.post("/reset-password", authController.resetPassword);
    router.get("/me", authMiddleware, authController.getProfile);
    router.patch("/profile", authMiddleware, authController.updateProfile);
    router.post("/change-password", authMiddleware, authController.changePassword);
    router.post("/email-update/send-otp", authMiddleware, authController.sendEmailUpdateOtp);
    router.post("/email-update/verify", authMiddleware, authController.verifyEmailUpdate);
    router.post("/email-update/resend-otp", authMiddleware, authController.resendEmailUpdateOtp);

    router.get("/google", passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    }));

    router.get("/google/callback",
        passport.authenticate("google", {
            session: false,
            failureRedirect: `${config.FRONTEND_URL}/login?error=google_auth_failed`,
        }),
        authController.googleCallback
    );

    return router;
};
