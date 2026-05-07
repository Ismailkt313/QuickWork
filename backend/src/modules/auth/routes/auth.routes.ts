import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import passport from "../../../config/passport";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt.util";
import { IUser, ITokenPayload } from "../interfaces/auth.interface";
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

    router.get("/google", passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    }));

    router.get("/google/callback",
        passport.authenticate("google", {
            session: false,
            failureRedirect: `${config.FRONTEND_URL}/login?error=google_auth_failed`,
        }),
        (req, res) => {
            if (!req.user) {
                return res.redirect(`${config.FRONTEND_URL}/login?error=google_auth_failed`);
            }

            const user = req.user as any as IUser;

            const tokenPayload: ITokenPayload = {
                userId: user._id.toString(),
                role: user.role,
            };

            const accessToken = generateAccessToken(tokenPayload);
            const refreshToken = generateRefreshToken(tokenPayload);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.redirect(
                `${config.FRONTEND_URL}/auth/google/callback?accessToken=${accessToken}`
            );
        }
    );

    return router;
};
