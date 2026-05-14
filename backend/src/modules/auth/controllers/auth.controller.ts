import { Request, Response, NextFunction } from "express";
import { IAuthService, IUser, ITokenPayload } from "../interfaces/auth.interface";
import { SendOtpDto } from "../dtos/send-otp.dto";
import { VerifyOtpDto } from "../dtos/verify-otp.dto";
import { ResendOtpDto } from "../dtos/resend-otp.dto";
import { LoginDto } from "../dtos/login.dto";
import { ForgotPasswordDto } from "../dtos/forgot-password.dto";
import { ResetPasswordDto } from "../dtos/reset-password.dto";
import { HttpStatusCode } from "../../../constants/httpStatusCode"
import { ErrorMessages } from "../../../constants/messages/errorMessages";
import { SuccessMessages } from "../../../constants/messages/successMessages";
import { config } from "../../../config";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt.util";

import { IAuthController } from '../interfaces/auth.interface';

export class AuthController implements IAuthController {
    private readonly _authService: IAuthService;

    constructor(authService: IAuthService) {
        this._authService = authService;
    }

    private setTokenCookie(res: Response, token: string) {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
    }

    private clearTokenCookie(res: Response) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
    }

    public sendOtp = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {

            const dto = SendOtpDto.create(req.body);
            const result = await this._authService.sendOtp(dto);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public verifyOtp = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const dto = VerifyOtpDto.create(req.body);
            const result = await this._authService.verifyOtp(dto);
            res.status(HttpStatusCode.CREATED).json(result);
        } catch (error) {
            next(error);
        }
    };

    public resendOtp = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const dto = ResendOtpDto.create(req.body);
            const result = await this._authService.resendOtp(dto);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const dto = LoginDto.create(req.body);
            const result = await this._authService.login(dto);
            if (result.success && result.data?.refreshToken) {
                this.setTokenCookie(res, result.data.refreshToken);

                delete (result.data as any).refreshToken;
            }
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public refreshToken = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

            if (!refreshToken) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: ErrorMessages.REFRESH_TOKEN_REQUIRED,
                });
                return;
            }

            const result = await this._authService.refreshToken(refreshToken);
            if (result.success && result.data?.refreshToken) {
                this.setTokenCookie(res, result.data.refreshToken);
                delete (result.data as any).refreshToken;
            }
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
    public adminLogin = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const dto = LoginDto.create(req.body);
            const result = await this._authService.adminLogin(dto);
            if (result.success && result.data?.refreshToken) {
                this.setTokenCookie(res, result.data.refreshToken);
                delete (result.data as any).refreshToken;
            }
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
    public logout = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (!refreshToken) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: ErrorMessages.REFRESH_TOKEN_REQUIRED,
                });
                return;
            }
            const result = await this._authService.logout(refreshToken);
            this.clearTokenCookie(res);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {

            next(error);
        }
    }

    public forgotPassword = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const dto = ForgotPasswordDto.create(req.body);
            const result = await this._authService.forgotPassword(dto);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public resetPassword = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const dto = ResetPasswordDto.create(req.body);
            const result = await this._authService.resetPassword(dto);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public getProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = (req.user as any).userId;
            const result = await this._authService.getProfile(userId);
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: SuccessMessages.PROFILE_FETCHED,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    public updateProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = (req.user as any).userId;
            const { name, number, profileImage } = req.body;
            const result = await this._authService.updateProfile(userId, { name, number, profileImage });
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: SuccessMessages.PROFILE_UPDATED,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    public changePassword = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = (req.user as any).userId;
            const { currentPassword, newPassword } = req.body;
            await this._authService.changePassword(userId, { currentPassword, newPassword });
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: SuccessMessages.PASSWORD_CHANGED
            });
        } catch (error) {
            next(error);
        }
    };

    public sendEmailUpdateOtp = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = (req.user as any).userId;
            const { newEmail } = req.body;
            const result = await this._authService.sendEmailUpdateOtp(userId, { newEmail });
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public verifyEmailUpdate = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = (req.user as any).userId;
            const { newEmail, otp } = req.body;
            const result = await this._authService.verifyEmailUpdate(userId, { newEmail, otp });
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public resendEmailUpdateOtp = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = (req.user as any).userId;
            const { newEmail } = req.body;
            const result = await this._authService.resendEmailUpdateOtp(userId, { newEmail });
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };

    public googleCallback = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
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

            this.setTokenCookie(res, refreshToken);

            res.redirect(
                `${config.FRONTEND_URL}/auth/google/callback?accessToken=${accessToken}`
            );
        } catch (error) {
            next(error);
        }
    };
}
