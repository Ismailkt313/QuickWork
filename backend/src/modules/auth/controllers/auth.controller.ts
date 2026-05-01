import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../interfaces/auth.interface";
import { SendOtpDto } from "../dtos/send-otp.dto";
import { VerifyOtpDto } from "../dtos/verify-otp.dto";
import { ResendOtpDto } from "../dtos/resend-otp.dto";
import { LoginDto } from "../dtos/login.dto";
import { ForgotPasswordDto } from "../dtos/forgot-password.dto";
import { ResetPasswordDto } from "../dtos/reset-password.dto";
import { HttpStatusCode } from "../../../constants/httpStatusCode"
import { ErrorMessages } from "../../../constants/messages/errorMessages";
import { SuccessMessages } from "../../../constants/messages/successMessages";

import { IAuthController } from '../interfaces/auth.interface';

export class AuthController implements IAuthController {
    private readonly authService: IAuthService;

    constructor(authService: IAuthService) {
        this.authService = authService;
    }

    public sendOtp = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {

            const dto = SendOtpDto.create(req.body);
            const result = await this.authService.sendOtp(dto);
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
            const result = await this.authService.verifyOtp(dto);
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
            const result = await this.authService.resendOtp(dto);
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
            const result = await this.authService.login(dto);
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
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: ErrorMessages.REFRESH_TOKEN_REQUIRED,
                });
                return;
            }

            const result = await this.authService.refreshToken(refreshToken);
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
            const result = await this.authService.adminLogin(dto);
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
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: ErrorMessages.REFRESH_TOKEN_REQUIRED,
                });
                return;
            }
            const result = await this.authService.logout(refreshToken);
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
            const result = await this.authService.forgotPassword(dto);
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
            const result = await this.authService.resetPassword(dto);
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
            const result = await this.authService.getProfile(userId);
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
            const { name, number } = req.body;
            const result = await this.authService.updateProfile(userId, { name, number });
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
            await this.authService.changePassword(userId, { currentPassword, newPassword });
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: SuccessMessages.PASSWORD_CHANGED
            });
        } catch (error) {
            next(error);
        }
    };
}
