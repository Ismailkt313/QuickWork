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
import { SuccessMessages } from "../../../constants/messages/successMessages";
import { ErrorMessages } from "../../../constants/messages/errorMessages";
import { HttpStatusCode } from "../../../constants/httpStatusCode";
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
            throw new AppError(ErrorMessages.EMAIL_ALREADY_EXISTS, HttpStatusCode.CONFLICT);
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
            message: SuccessMessages.OTP_SENT(userData.email, Math.floor(config.OTP_EXPIRY_SECONDS / 60)),
        };
    }

    public async verifyOtp(input: IVerifyOtpInput): Promise<IVerifyOtpResponse> {
        const otpEntry = await this.otpRepository.findByEmailAndType(input.email.toLowerCase().trim(), OTP_TYPE.REGISTRATION);
        if (!otpEntry) {
            throw new AppError(ErrorMessages.REGISTRATION_SESSION_EXPIRED, HttpStatusCode.BAD_REQUEST);
        }

        if (otpEntry.otpExpiresAt < new Date()) {
            throw new AppError(ErrorMessages.OTP_EXPIRED, HttpStatusCode.BAD_REQUEST);
        }

        const isValid = await compareOtp(input.otp, otpEntry.hashedOtp);
        if (!isValid) {
            throw new AppError(ErrorMessages.INVALID_OTP, HttpStatusCode.BAD_REQUEST);
        }

        await this.authRepository.createUser(otpEntry.userData!);
        await this.otpRepository.deleteByEmailAndType(input.email, OTP_TYPE.REGISTRATION);

        return {
            success: true,
            message: SuccessMessages.EMAIL_VERIFIED,
        };
    }

    public async resendOtp(input: IResendOtpInput): Promise<IResendOtpResponse> {
        const otpEntry = await this.otpRepository.findByEmailAndType(input.email.toLowerCase().trim(), OTP_TYPE.REGISTRATION);
        if (!otpEntry) {
            throw new AppError(ErrorMessages.REGISTRATION_SESSION_EXPIRED, HttpStatusCode.BAD_REQUEST);
        }

        const otp = generateOtp();
        const hashedOtpValue = await hashOtp(otp);
        const otpExpiresAt = new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000);

        await this.otpRepository.updateOtp(otpEntry.email, hashedOtpValue, OTP_TYPE.REGISTRATION, otpExpiresAt);
        await sendOtpEmail(otpEntry.email, otp);

        return {
            success: true,
            message: SuccessMessages.OTP_RESENT(otpEntry.email, Math.floor(config.OTP_EXPIRY_SECONDS / 60)),
        };
    }

    public async login(input: ILoginInput): Promise<ILoginResponse> {
        const user = await this.authRepository.findByEmailWithPassword(input.email);
        if (!user) {
            throw new AppError(ErrorMessages.INVALID_CREDENTIALS, HttpStatusCode.UNAUTH0RIZED);
        }

        if (user.isBlocked) {
            throw new AppError(ErrorMessages.ACCOUNT_BLOCKED, HttpStatusCode.FORBIDDEN);
        }

        if (!user.hashedPassword) {
            throw new AppError(ErrorMessages.INVALID_CREDENTIALS, HttpStatusCode.UNAUTH0RIZED);
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.hashedPassword);
        if (!isPasswordValid) {
            throw new AppError(ErrorMessages.INVALID_CREDENTIALS, HttpStatusCode.BAD_REQUEST);
        }

        const tokenPayload: ITokenPayload = {
            userId: user._id.toString(),
            role: user.role,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        return {
            success: true,
            message: SuccessMessages.LOGIN_SUCCESS,
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
            throw new AppError(ErrorMessages.INVALID_OR_EXPIRED_TOKEN, HttpStatusCode.UNAUTH0RIZED);
        }

        const user = await this.authRepository.findById(decoded.userId);
        if (!user) {
            throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatusCode.UNAUTH0RIZED);
        }

        if (user.isBlocked) {
            throw new AppError(ErrorMessages.ACCOUNT_BLOCKED, HttpStatusCode.FORBIDDEN);
        }

        const tokenPayload: ITokenPayload = {
            userId: user._id.toString(),
            role: user.role,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const newRefreshToken = generateRefreshToken(tokenPayload);

        return {
            success: true,
            message: SuccessMessages.TOKEN_REFRESHED,
            data: {
                accessToken,
                refreshToken: newRefreshToken,
            },
        };
    }
    public async adminLogin(input: ILoginInput): Promise<IAdminLoginResponse> {
        const genericError = new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTH0RIZED);

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
            message: SuccessMessages.ADMIN_LOGIN_SUCCESS,
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
                throw new AppError(ErrorMessages.INVALID_OR_EXPIRED_TOKEN, HttpStatusCode.UNAUTH0RIZED);
            }
            await this.otpRepository.deleteByRefreshToken(token);
        } catch {
            throw new AppError(ErrorMessages.INVALID_OR_EXPIRED_TOKEN, HttpStatusCode.UNAUTH0RIZED);
        }

        return {
            success: true,
            message: SuccessMessages.LOGOUT_SUCCESS,
        };
    }

    public async forgotPassword(input: IForgotPasswordInput): Promise<IForgotPasswordResponse> {
        const user = await this.authRepository.findByEmail(input.email.toLowerCase().trim());
        if (!user) {
            return {
                success: true,
                message: SuccessMessages.PASSWORD_RESET_LINK_SENT,
            };
        }

        const otp = generateOtp();
        
        const hashedOtpValue = await hashOtp(otp);
        const expiresAt = new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000);

        await this.otpRepository.upsert(user.email, hashedOtpValue, OTP_TYPE.PASSWORD_RESET, expiresAt, expiresAt);
        await sendOtpEmail(user.email, otp);

        return {
            success: true,
            message: SuccessMessages.PASSWORD_RESET_INSTRUCTIONS_SENT(user.email),
        };
    }

    public async resetPassword(input: IResetPasswordInput): Promise<IResetPasswordResponse> {
        const resetEntry = await this.otpRepository.findByEmailAndType(input.email.toLowerCase().trim(), OTP_TYPE.PASSWORD_RESET);
        if (!resetEntry) {
            throw new AppError(ErrorMessages.RESET_REQUEST_EXPIRED, HttpStatusCode.BAD_REQUEST);
        }

        if (resetEntry.expiresAt < new Date()) {
            throw new AppError(ErrorMessages.RESET_CODE_EXPIRED, HttpStatusCode.BAD_REQUEST);
        }

        const isValid = await compareOtp(input.otp, resetEntry.hashedOtp);
        if (!isValid) {
            throw new AppError(ErrorMessages.INVALID_RESET_CODE, HttpStatusCode.BAD_REQUEST);
        }

        const user = await this.authRepository.findByEmail(input.email.toLowerCase().trim());
        if (!user) {
            throw new AppError(ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatusCode.NOT_FOUND);
        }

        const hashedPassword = await bcrypt.hash(input.newPassword, config.BCRYPT_SALT_ROUNDS);
        await this.authRepository.updatePassword(user._id.toString(), hashedPassword);
        await this.otpRepository.deleteByEmailAndType(input.email, OTP_TYPE.PASSWORD_RESET);

        return {
            success: true,
            message: SuccessMessages.PASSWORD_RESET_SUCCESS,
        };
    }

    public async getProfile(userId: string): Promise<UserResponseDTO> {
        const user = await this.authRepository.findById(userId);
        if (!user) {
            throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (user.isBlocked) {
            throw new AppError(ErrorMessages.ACCOUNT_BLOCKED, HttpStatusCode.FORBIDDEN);
        }

        return mapUserToResponseDTO(user);
    }

    public async updateProfile(userId: string, data: IUpdateProfileInput): Promise<UserResponseDTO> {
        const currentUser = await this.authRepository.findById(userId);
        if (!currentUser) {
            throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (data.profileImage && currentUser.profileImage?.public_id && currentUser.profileImage.public_id !== data.profileImage.public_id) {
            try {
                await this.uploadService.deleteImage(currentUser.profileImage.public_id);
            } catch (error) {
                console.error('Failed to delete old profile image:', error);
            }
        }

        const user = await this.authRepository.updateUser(userId, data as any);
        if (!user) {
            throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        return mapUserToResponseDTO(user);
    }

    public async changePassword(userId: string, data: IChangePasswordInput): Promise<void> {
        const user = await this.authRepository.findByEmailWithPassword((await this.authRepository.findById(userId))?.email!);
        if (!user || !user.hashedPassword) {
            throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        const isPasswordValid = await bcrypt.compare(data.currentPassword, user.hashedPassword);
        if (!isPasswordValid) {
            throw new AppError(ErrorMessages.INVALID_CURRENT_PASSWORD, HttpStatusCode.BAD_REQUEST);
        }

        const hashedNewPassword = await bcrypt.hash(data.newPassword, config.BCRYPT_SALT_ROUNDS);
        await this.authRepository.updatePassword(userId, hashedNewPassword);
    }
}
