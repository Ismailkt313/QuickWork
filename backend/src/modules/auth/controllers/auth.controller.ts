import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../interfaces/auth.interface";
import { SendOtpDto } from "../dtos/send-otp.dto";
import { VerifyOtpDto } from "../dtos/verify-otp.dto";
import { ResendOtpDto } from "../dtos/resend-otp.dto";
import { LoginDto } from "../dtos/login.dto";
import { ForgotPasswordDto } from "../dtos/forgot-password.dto";
import { ResetPasswordDto } from "../dtos/reset-password.dto";

export class AuthController {
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
            res.status(200).json(result);
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
            res.status(201).json(result);
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
            res.status(200).json(result);
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
            res.status(200).json(result);
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
                res.status(400).json({
                    success: false,
                    message: "Refresh token is required",
                });
                return;
            }

            const result = await this.authService.refreshToken(refreshToken);
            res.status(200).json(result);
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
            res.status(200).json(result);
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
                res.status(400).json({
                    success: false,
                    message: "Refresh token is required",
                });
                return;
            }
            const result = await this.authService.logout(refreshToken);
            res.status(200).json(result);
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
            res.status(200).json(result);
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
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
