import bcrypt from "bcryptjs";
import {
    IAuthService,
    IAuthRepository,
    IOtpRepository,
    ISendOtpInput,
    ISendOtpResponse,
    IVerifyOtpInput,
    IVerifyOtpResponse,
    IResendOtpInput,
    IResendOtpResponse,
    ICreateUserData,
    ILoginInput,
    ILoginResponse,
    IAdminLoginResponse,
    IRefreshTokenResponse,
    ITokenPayload,
    ILogoutResponse,
    IForgotPasswordInput,
    IForgotPasswordResponse,
    IResetPasswordInput,
    IResetPasswordResponse,
} from "../interfaces/auth.interface";
import { config } from "../../../config";
import { AppError } from "../../../utils/AppError";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../../utils/jwt.util";
import { generateOtp, hashOtp, compareOtp } from "../../../utils/otp.util";
import { sendOtpEmail } from "../../../utils/email.util";

export class AuthService implements IAuthService {
    private readonly authRepository: IAuthRepository;
    private readonly otpRepository: IOtpRepository;

    constructor(
        authRepository: IAuthRepository,
        otpRepository: IOtpRepository
    ) {
        this.authRepository = authRepository;
        this.otpRepository = otpRepository;
    }

    public async sendOtp(input: ISendOtpInput): Promise<ISendOtpResponse> {
        const existingUser = await this.authRepository.findByEmail(input.email);
        if (existingUser) {
            throw new AppError("Email already exists", 409);
        }

        const hashedPassword = await bcrypt.hash(
            input.password,
            config.BCRYPT_SALT_ROUNDS
        );

        const userData: ICreateUserData = {
            name: input.name.trim(),
            email: input.email.toLowerCase().trim(),
            hashedPassword,
            role: input.role,
            isBlocked: false,
        };

        const otp = generateOtp();
        
        const hashedOtpValue = await hashOtp(otp);
        const otpExpiresAt = new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000);
        const expiresAt = new Date(Date.now() + config.OTP_TTL_SECONDS * 1000);

        await this.otpRepository.upsert(userData.email, hashedOtpValue, "registration", otpExpiresAt, expiresAt, userData);
        await sendOtpEmail(userData.email, otp);

        return {
            success: true,
            message: `OTP sent to ${userData.email}. Expires in ${Math.floor(config.OTP_EXPIRY_SECONDS / 60)} minutes`,
        };
    }

    public async verifyOtp(input: IVerifyOtpInput): Promise<IVerifyOtpResponse> {
        const otpEntry = await this.otpRepository.findByEmailAndType(input.email.toLowerCase().trim(), "registration");
        if (!otpEntry) {
            throw new AppError("Registration session expired. Please register again", 400);
        }

        if (otpEntry.otpExpiresAt < new Date()) {
            throw new AppError("OTP has expired. Please resend OTP", 400);
        }

        const isValid = await compareOtp(input.otp, otpEntry.hashedOtp);
        if (!isValid) {
            throw new AppError("Invalid OTP", 400);
        }

        await this.authRepository.createUser(otpEntry.userData!);
        await this.otpRepository.deleteByEmailAndType(input.email, "registration");

        return {
            success: true,
            message: "Email verified and user registered successfully",
        };
    }

    public async resendOtp(input: IResendOtpInput): Promise<IResendOtpResponse> {
        const otpEntry = await this.otpRepository.findByEmailAndType(input.email.toLowerCase().trim(), "registration");
        if (!otpEntry) {
            throw new AppError("Registration session expired. Please register again", 400);
        }

        const otp = generateOtp();
        
        const hashedOtpValue = await hashOtp(otp);
        const otpExpiresAt = new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000);

        await this.otpRepository.updateOtp(otpEntry.email, hashedOtpValue, "registration", otpExpiresAt);
        await sendOtpEmail(otpEntry.email, otp);

        return {
            success: true,
            message: `OTP resent to ${otpEntry.email}. Expires in ${Math.floor(config.OTP_EXPIRY_SECONDS / 60)} minutes`,
        };
    }

    public async login(input: ILoginInput): Promise<ILoginResponse> {
        const user = await this.authRepository.findByEmailWithPassword(input.email);
        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }

        if (user.isBlocked) {
            throw new AppError("Your account has been blocked", 403);
        }

        if (!user.hashedPassword) {
            throw new AppError("Invalid credentials", 401);
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.hashedPassword);
        if (!isPasswordValid) {
            throw new AppError("Invalid credentials", 401);
        }

        const tokenPayload: ITokenPayload = {
            userId: user._id.toString(),
            role: user.role,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        return {
            success: true,
            message: "Login successful",
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        };
    }

    public async refreshToken(token: string): Promise<IRefreshTokenResponse> {
        let decoded: ITokenPayload;

        try {
            decoded = verifyRefreshToken(token);
        } catch {
            throw new AppError("Invalid or expired refresh token", 401);
        }

        const user = await this.authRepository.findById(decoded.userId);
        if (!user) {
            throw new AppError("User not found", 401);
        }

        if (user.isBlocked) {
            throw new AppError("Your account has been blocked", 403);
        }

        const tokenPayload: ITokenPayload = {
            userId: user._id.toString(),
            role: user.role,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const newRefreshToken = generateRefreshToken(tokenPayload);

        return {
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
            },
        };
    }
    public async adminLogin(input: ILoginInput): Promise<IAdminLoginResponse> {
        const genericError = new AppError("Unauthorized access", 401);

        const user = await this.authRepository.findByEmailWithPassword(input.email);
        if (!user) {
            throw genericError;
        }

        if (!user.hashedPassword) {
            throw genericError;
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.hashedPassword);
        if (!isPasswordValid) {
            throw genericError;
        }

        if (user.isBlocked) {
            throw genericError;
        }

        if (user.role !== "admin") {
            throw genericError;
        }

        const tokenPayload: ITokenPayload = {
            userId: user._id.toString(),
            role: user.role,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        return {
            success: true,
            message: "Admin login successful",
            data: {
                accessToken,
                refreshToken,
                admin: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        };
    }
    public async logout(token: string): Promise<ILogoutResponse> {
        try {
            let varify = verifyRefreshToken(token);
            if (!varify) {
                throw new AppError("Invalid or expired refresh token", 401);
            }
            await this.otpRepository.deleteByRefreshToken(token);
        } catch {
            throw new AppError("Invalid or expired refresh token", 401);
        }

        return {
            success: true,
            message: "Logout successful",
        };
    }

    public async forgotPassword(input: IForgotPasswordInput): Promise<IForgotPasswordResponse> {
        const user = await this.authRepository.findByEmail(input.email.toLowerCase().trim());
        if (!user) {
            return {
                success: true,
                message: "If an account exists for this email, a reset code has been sent",
            };
        }

        const otp = generateOtp();
        
        const hashedOtpValue = await hashOtp(otp);
        const expiresAt = new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000);

        await this.otpRepository.upsert(user.email, hashedOtpValue, "password-reset", expiresAt, expiresAt);
        await sendOtpEmail(user.email, otp);

        return {
            success: true,
            message: `Instructions to reset your password have been sent to ${user.email}`,
        };
    }

    public async resetPassword(input: IResetPasswordInput): Promise<IResetPasswordResponse> {
        const resetEntry = await this.otpRepository.findByEmailAndType(input.email.toLowerCase().trim(), "password-reset");
        if (!resetEntry) {
            throw new AppError("Reset request expired. Please start over", 400);
        }

        if (resetEntry.expiresAt < new Date()) {
            throw new AppError("Reset code has expired", 400);
        }

        const isValid = await compareOtp(input.otp, resetEntry.hashedOtp);
        if (!isValid) {
            throw new AppError("Invalid reset code", 400);
        }

        const user = await this.authRepository.findByEmail(input.email.toLowerCase().trim());
        if (!user) {
            throw new AppError("Something went wrong", 404);
        }

        const hashedPassword = await bcrypt.hash(input.newPassword, config.BCRYPT_SALT_ROUNDS);
        await this.authRepository.updatePassword(user._id.toString(), hashedPassword);
        await this.otpRepository.deleteByEmailAndType(input.email, "password-reset");

        return {
            success: true,
            message: "Password has been reset successfully",
        };
    }
}
