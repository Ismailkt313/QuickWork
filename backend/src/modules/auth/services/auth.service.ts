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
    IUpdateProfileInput,
    IChangePasswordInput,
} from "../interfaces/auth.interface";
import { ROLES } from "../../../constants/roles";
import { OTP_TYPE } from "../../../constants/otp";
import { config } from "../../../config";
import { AppError } from "../../../utils/AppError";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../../utils/jwt.util";
import { generateOtp, hashOtp, compareOtp } from "../../../utils/otp.util";
import { sendOtpEmail } from "../../../utils/email.util";
import { mapUserToResponseDTO, UserResponseDTO } from "../dtos/userResponse.dto";
import { HttpStatusCode } from "../../../constants/httpStatusCode"
import { UploadService } from "../../upload/services/upload.service";

export class AuthService implements IAuthService {
    private readonly authRepository: IAuthRepository;
    private readonly otpRepository: IOtpRepository;
    private readonly uploadService: UploadService;

    constructor(
        authRepository: IAuthRepository,
        otpRepository: IOtpRepository,
        uploadService: UploadService
    ) {
        this.authRepository = authRepository;
        this.otpRepository = otpRepository;
        this.uploadService = uploadService;
    }

    public async sendOtp(input: ISendOtpInput): Promise<ISendOtpResponse> {
        const existingUser = await this.authRepository.findByEmail(input.email);
        if (existingUser) {
            throw new AppError("Email already exists", HttpStatusCode.CONFLICT);
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

        await this.otpRepository.upsert(userData.email, hashedOtpValue, OTP_TYPE.REGISTRATION, otpExpiresAt, expiresAt, userData);
        await sendOtpEmail(userData.email, otp);

        return {
            success: true,
            message: `OTP sent to ${userData.email}. Expires in ${Math.floor(config.OTP_EXPIRY_SECONDS / 60)} minutes`,
        };
    }

    public async verifyOtp(input: IVerifyOtpInput): Promise<IVerifyOtpResponse> {
        const otpEntry = await this.otpRepository.findByEmailAndType(input.email.toLowerCase().trim(), OTP_TYPE.REGISTRATION);
        if (!otpEntry) {
            throw new AppError("Registration session expired. Please register again", HttpStatusCode.BAD_REQUEST);
        }

        if (otpEntry.otpExpiresAt < new Date()) {
            throw new AppError("OTP has expired. Please resend OTP", HttpStatusCode.BAD_REQUEST);
        }

        const isValid = await compareOtp(input.otp, otpEntry.hashedOtp);
        if (!isValid) {
            throw new AppError("Invalid OTP", HttpStatusCode.BAD_REQUEST);
        }

        await this.authRepository.createUser(otpEntry.userData!);
        await this.otpRepository.deleteByEmailAndType(input.email, OTP_TYPE.REGISTRATION);

        return {
            success: true,
            message: "Email verified and user registered successfully",
        };
    }

    public async resendOtp(input: IResendOtpInput): Promise<IResendOtpResponse> {
        const otpEntry = await this.otpRepository.findByEmailAndType(input.email.toLowerCase().trim(), OTP_TYPE.REGISTRATION);
        if (!otpEntry) {
            throw new AppError("Registration session expired. Please register again", HttpStatusCode.BAD_REQUEST);
        }

        const otp = generateOtp();
        console.log(`Generated OTP for ${input.email}: ${otp}`); // Log OTP
        const hashedOtpValue = await hashOtp(otp);
        const otpExpiresAt = new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000);

        await this.otpRepository.updateOtp(otpEntry.email, hashedOtpValue, OTP_TYPE.REGISTRATION, otpExpiresAt);
        await sendOtpEmail(otpEntry.email, otp);

        return {
            success: true,
            message: `OTP resent to ${otpEntry.email}. Expires in ${Math.floor(config.OTP_EXPIRY_SECONDS / 60)} minutes`,
        };
    }

    public async login(input: ILoginInput): Promise<ILoginResponse> {
        const user = await this.authRepository.findByEmailWithPassword(input.email);
        if (!user) {
            throw new AppError("Invalid credentials", HttpStatusCode.UNAUTH0RIZED);
        }

        if (user.isBlocked) {
            throw new AppError("Your account has been blocked", HttpStatusCode.FORBIDDEN);
        }

        if (!user.hashedPassword) {
            throw new AppError("Invalid credentials", HttpStatusCode.UNAUTH0RIZED);
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.hashedPassword);
        if (!isPasswordValid) {
            throw new AppError("Invalid credentials", HttpStatusCode.BAD_REQUEST);
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
                user: mapUserToResponseDTO(user),
            },
        };
    }

    public async refreshToken(token: string): Promise<IRefreshTokenResponse> {
        let decoded: ITokenPayload;

        try {
            decoded = verifyRefreshToken(token);
        } catch {
            throw new AppError("Invalid or expired refresh token", HttpStatusCode.UNAUTH0RIZED);
        }

        const user = await this.authRepository.findById(decoded.userId);
        if (!user) {
            throw new AppError("User not found", HttpStatusCode.UNAUTH0RIZED);
        }

        if (user.isBlocked) {
            throw new AppError("Your account has been blocked", HttpStatusCode.FORBIDDEN);
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
        const genericError = new AppError("Unauthorized access", HttpStatusCode.UNAUTH0RIZED);

        const user = await this.authRepository.findByEmailWithPassword(input.email);
        console.log("Admin Login Attempt:"); // Log login attempt and role
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
        if (user.role !== ROLES.ADMIN) {
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
                admin: mapUserToResponseDTO(user),
            },
        };
    }
    public async logout(token: string): Promise<ILogoutResponse> {
        try {
            const varify = verifyRefreshToken(token);
            if (!varify) {
                throw new AppError("Invalid or expired refresh token", HttpStatusCode.UNAUTH0RIZED);
            }
            await this.otpRepository.deleteByRefreshToken(token);
        } catch {
            throw new AppError("Invalid or expired refresh token", HttpStatusCode.UNAUTH0RIZED);
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

        await this.otpRepository.upsert(user.email, hashedOtpValue, OTP_TYPE.PASSWORD_RESET, expiresAt, expiresAt);
        await sendOtpEmail(user.email, otp);

        return {
            success: true,
            message: `Instructions to reset your password have been sent to ${user.email}`,
        };
    }

    public async resetPassword(input: IResetPasswordInput): Promise<IResetPasswordResponse> {
        const resetEntry = await this.otpRepository.findByEmailAndType(input.email.toLowerCase().trim(), OTP_TYPE.PASSWORD_RESET);
        if (!resetEntry) {
            throw new AppError("Reset request expired. Please start over", HttpStatusCode.BAD_REQUEST);
        }

        if (resetEntry.expiresAt < new Date()) {
            throw new AppError("Reset code has expired", HttpStatusCode.BAD_REQUEST);
        }

        const isValid = await compareOtp(input.otp, resetEntry.hashedOtp);
        if (!isValid) {
            throw new AppError("Invalid reset code", HttpStatusCode.BAD_REQUEST);
        }

        const user = await this.authRepository.findByEmail(input.email.toLowerCase().trim());
        if (!user) {
            throw new AppError("Something went wrong", HttpStatusCode.NOT_FOUND);
        }

        const hashedPassword = await bcrypt.hash(input.newPassword, config.BCRYPT_SALT_ROUNDS);
        await this.authRepository.updatePassword(user._id.toString(), hashedPassword);
        await this.otpRepository.deleteByEmailAndType(input.email, OTP_TYPE.PASSWORD_RESET);

        return {
            success: true,
            message: "Password has been reset successfully",
        };
    }

    public async getProfile(userId: string): Promise<UserResponseDTO> {
        const user = await this.authRepository.findById(userId);
        if (!user) {
            throw new AppError("User not found", HttpStatusCode.NOT_FOUND);
        }

        if (user.isBlocked) {
            throw new AppError("Your account has been blocked", HttpStatusCode.FORBIDDEN);
        }

        return mapUserToResponseDTO(user);
    }

    public async updateProfile(userId: string, data: IUpdateProfileInput): Promise<UserResponseDTO> {
        const currentUser = await this.authRepository.findById(userId);
        if (!currentUser) {
            throw new AppError("User not found", HttpStatusCode.NOT_FOUND);
        }

        // Handle profile image cleanup if a new one is provided
        if (data.profileImage && currentUser.profileImage?.public_id && currentUser.profileImage.public_id !== data.profileImage.public_id) {
            try {
                await this.uploadService.deleteImage(currentUser.profileImage.public_id);
            } catch (error) {
                console.error('Failed to delete old profile image:', error);
                // We don't throw here to avoid failing the profile update just because cleanup failed
            }
        }

        const user = await this.authRepository.updateUser(userId, data as any);
        if (!user) {
            throw new AppError("User not found", HttpStatusCode.NOT_FOUND);
        }
        return mapUserToResponseDTO(user);
    }

    public async changePassword(userId: string, data: IChangePasswordInput): Promise<void> {
        const user = await this.authRepository.findByEmailWithPassword((await this.authRepository.findById(userId))?.email!);
        if (!user || !user.hashedPassword) {
            throw new AppError("User not found", HttpStatusCode.NOT_FOUND);
        }
        console.log('data for change password',data)
        const isPasswordValid = await bcrypt.compare(data.currentPassword, user.hashedPassword);
        if (!isPasswordValid) {
            throw new AppError("Invalid current password", HttpStatusCode.BAD_REQUEST);
        }

        const hashedNewPassword = await bcrypt.hash(data.newPassword, config.BCRYPT_SALT_ROUNDS);
        await this.authRepository.updatePassword(userId, hashedNewPassword);
    }
}
