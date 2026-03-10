import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import passport from "../../../config/passport";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt.util";
import { IUser, ITokenPayload } from "../interfaces/auth.interface";
import { config } from "../../../config";

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

    router.get("/google", passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    }));

    router.get("/google/callback",
        passport.authenticate("google", {
            session: false,
            failureRedirect: `${config.url}/login?error=google_auth_failed`,
        }),
        (req, res) => {
            if (!req.user) {
                return res.redirect(`${config.url}/login?error=google_auth_failed`);
            }

            const user = req.user as any as IUser;

            const tokenPayload: ITokenPayload = {
                userId: user._id.toString(),
                role: user.role,
            };

            const accessToken = generateAccessToken(tokenPayload);
            const refreshToken = generateRefreshToken(tokenPayload);

            res.redirect(
                `http://localhost:5173/auth/google/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
            );
        }
    );

    return router;
};
