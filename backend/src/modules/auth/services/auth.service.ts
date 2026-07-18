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
    ISendEmailUpdateOtpInput,
    ISendEmailUpdateOtpResponse,
    IVerifyEmailUpdateInput,
    IVerifyEmailUpdateResponse,
    IResendEmailUpdateOtpInput,
    IResendEmailUpdateOtpResponse,
    IUser,
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
import { IUploadService } from "../../../shared/upload/interfaces/upload.interface";
import { ILogger } from "../../../shared/interfaces/ILogger";

export class AuthService implements IAuthService {
    private readonly _authRepository: IAuthRepository;
    private readonly _otpRepository: IOtpRepository;
    private readonly _uploadService: IUploadService;
    private readonly _logger: ILogger;

    constructor(
        authRepository: IAuthRepository,
        otpRepository: IOtpRepository,
        uploadService: IUploadService,
        logger: ILogger
    ) {
        this._authRepository = authRepository;
        this._otpRepository = otpRepository;
        this._uploadService = uploadService;
        this._logger = logger;
    }

    public async sendOtp(input: ISendOtpInput): Promise<ISendOtpResponse> {
        const existingUser = await this._authRepository.findByEmail(input.email);
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

        await this._otpRepository.upsert(userData.email, hashedOtpValue, OTP_TYPE.REGISTRATION, otpExpiresAt, expiresAt, userData);
        await sendOtpEmail(userData.email, otp);

        return {
            success: true,
            message: SuccessMessages.OTP_SENT(userData.email, Math.floor(config.OTP_EXPIRY_SECONDS / 60)),
        };
    }

    public async verifyOtp(input: IVerifyOtpInput): Promise<IVerifyOtpResponse> {
        const otpEntry = await this._otpRepository.findByEmailAndType(input.email.toLowerCase().trim(), OTP_TYPE.REGISTRATION);
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

        const user = await this._authRepository.create(otpEntry.userData!);
        this._logger.info("Registration", { email: user.email, role: user.role, userId: user._id });
        await this._otpRepository.deleteByEmailAndType(input.email, OTP_TYPE.REGISTRATION);

        return {
            success: true,
            message: SuccessMessages.EMAIL_VERIFIED,
        };
    }

    public async resendOtp(input: IResendOtpInput): Promise<IResendOtpResponse> {
        const otpEntry = await this._otpRepository.findByEmailAndType(input.email.toLowerCase().trim(), OTP_TYPE.REGISTRATION);
        if (!otpEntry) {
            throw new AppError(ErrorMessages.REGISTRATION_SESSION_EXPIRED, HttpStatusCode.BAD_REQUEST);
        }

        const otp = generateOtp();
        const hashedOtpValue = await hashOtp(otp);
        const otpExpiresAt = new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000);

        await this._otpRepository.updateOtp(otpEntry.email, hashedOtpValue, OTP_TYPE.REGISTRATION, otpExpiresAt);
        await sendOtpEmail(otpEntry.email, otp);

        return {
            success: true,
            message: SuccessMessages.OTP_RESENT(otpEntry.email, Math.floor(config.OTP_EXPIRY_SECONDS / 60)),
        };
    }

    public async login(input: ILoginInput): Promise<ILoginResponse> {
        const user = await this._authRepository.findByEmailWithPassword(input.email);
        if (!user) {
            throw new AppError(ErrorMessages.INVALID_CREDENTIALS, HttpStatusCode.UNAUTHORIZED);
        }

        if (user.isBlocked) {
            throw new AppError(ErrorMessages.ACCOUNT_BLOCKED, HttpStatusCode.FORBIDDEN);
        }

        if (!user.hashedPassword) {
            if (user.authProvider === 'google') {
                throw new AppError("This account was created using Google Sign-In. Please continue with Google or set a password.", HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError(ErrorMessages.INVALID_CREDENTIALS, HttpStatusCode.UNAUTHORIZED);
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.hashedPassword);
        if (!isPasswordValid) {
            this._logger.warn("Login Failed", { email: input.email, status: "failed", reason: "invalid_password" });
            throw new AppError(ErrorMessages.INVALID_CREDENTIALS, HttpStatusCode.BAD_REQUEST);
        }

        const tokenPayload: ITokenPayload = {
            userId: user._id.toString(),
            role: user.role,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        this._logger.info("Login Success", { userId: user._id, email: user.email, role: user.role });

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
            throw new AppError(ErrorMessages.INVALID_OR_EXPIRED_TOKEN, HttpStatusCode.UNAUTHORIZED);
        }

        const user = await this._authRepository.findById(decoded.userId);
        if (!user) {
            throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatusCode.UNAUTHORIZED);
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
        const genericError = new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

        const user = await this._authRepository.findByEmailWithPassword(input.email);
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
                throw new AppError(ErrorMessages.INVALID_OR_EXPIRED_TOKEN, HttpStatusCode.UNAUTHORIZED);
            }
            await this._otpRepository.deleteByRefreshToken(token);
        } catch {
            throw new AppError(ErrorMessages.INVALID_OR_EXPIRED_TOKEN, HttpStatusCode.UNAUTHORIZED);
        }

        return {
            success: true,
            message: SuccessMessages.LOGOUT_SUCCESS,
        };
    }

    public async forgotPassword(input: IForgotPasswordInput): Promise<IForgotPasswordResponse> {
        const user = await this._authRepository.findByEmail(input.email.toLowerCase().trim());
        if (!user) {
            throw new AppError(ErrorMessages.EMAIL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const otp = generateOtp();

        const hashedOtpValue = await hashOtp(otp);
        const expiresAt = new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000);

        await this._otpRepository.upsert(user.email, hashedOtpValue, OTP_TYPE.PASSWORD_RESET, expiresAt, expiresAt);
        await sendOtpEmail(user.email, otp);

        return {
            success: true,
            message: SuccessMessages.PASSWORD_RESET_INSTRUCTIONS_SENT(user.email),
        };
    }

    public async resetPassword(input: IResetPasswordInput): Promise<IResetPasswordResponse> {
        const resetEntry = await this._otpRepository.findByEmailAndType(input.email.toLowerCase().trim(), OTP_TYPE.PASSWORD_RESET);
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

        const user = await this._authRepository.findByEmail(input.email.toLowerCase().trim());
        if (!user) {
            throw new AppError(ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatusCode.NOT_FOUND);
        }

        const hashedPassword = await bcrypt.hash(input.newPassword, config.BCRYPT_SALT_ROUNDS);
        await this._authRepository.updatePassword(user._id.toString(), hashedPassword);
        if (user.authProvider === 'google') {
            await this._authRepository.updateById(user._id.toString(), { authProvider: 'hybrid', hasPassword: true } as Partial<IUser>);
        }
        await this._otpRepository.deleteByEmailAndType(input.email, OTP_TYPE.PASSWORD_RESET);

        return {
            success: true,
            message: SuccessMessages.PASSWORD_RESET_SUCCESS,
        };
    }

    public async getProfile(userId: string): Promise<UserResponseDTO> {
        const user = await this._authRepository.findById(userId);
        if (!user) {
            throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (user.isBlocked) {
            throw new AppError(ErrorMessages.ACCOUNT_BLOCKED, HttpStatusCode.FORBIDDEN);
        }

        return mapUserToResponseDTO(user);
    }

    public async updateProfile(userId: string, data: IUpdateProfileInput): Promise<UserResponseDTO> {
        const currentUser = await this._authRepository.findById(userId);
        if (!currentUser) {
            throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (data.profileImage && currentUser.profileImage?.public_id && currentUser.profileImage.public_id !== data.profileImage.public_id) {
            try {
                await this._uploadService.deleteImage(currentUser.profileImage.public_id);
            } catch (error: any) {
                this._logger.error("Failed to delete old profile image", { error: error?.message, publicId: currentUser.profileImage.public_id });
            }

        }

        const user = await this._authRepository.updateById(userId, data as Partial<IUser>);
        if (!user) {
            throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        return mapUserToResponseDTO(user);
    }

    public async changePassword(userId: string, data: IChangePasswordInput): Promise<void> {
        const existingUser = await this._authRepository.findById(userId);
        if (!existingUser) {
            throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        const user = await this._authRepository.findByEmailWithPassword(existingUser.email);
        if (!user) {
            throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
        }

        if (!user.hashedPassword && user.authProvider === 'google') {
            if (data.newPassword.length < 6) throw new AppError("New password must be at least 6 characters", HttpStatusCode.BAD_REQUEST);
            if (!/[A-Z]/.test(data.newPassword)) throw new AppError("New password must contain at least one uppercase letter", HttpStatusCode.BAD_REQUEST);
            if (!/[0-9]/.test(data.newPassword)) throw new AppError("New password must contain at least one number", HttpStatusCode.BAD_REQUEST);
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.newPassword)) throw new AppError("New password must contain at least one special character", HttpStatusCode.BAD_REQUEST);

            const hashedNewPassword = await bcrypt.hash(data.newPassword, config.BCRYPT_SALT_ROUNDS);
            await this._authRepository.updatePassword(userId, hashedNewPassword);
            await this._authRepository.updateById(userId, { authProvider: 'hybrid', hasPassword: true } as Partial<IUser>);
            return;
        }

        if (!user.hashedPassword) {
            throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
        }
        
        if (!data.currentPassword) {
            throw new AppError("Current password is required", HttpStatusCode.BAD_REQUEST);
        }

        const isPasswordValid = await bcrypt.compare(data.currentPassword, user.hashedPassword);
        if (!isPasswordValid) {
            throw new AppError(ErrorMessages.INVALID_CURRENT_PASSWORD, HttpStatusCode.BAD_REQUEST);
        }

        if (data.newPassword.length < 6) {
            throw new AppError("New password must be at least 6 characters", HttpStatusCode.BAD_REQUEST);
        }
        if (!/[A-Z]/.test(data.newPassword)) {
            throw new AppError("New password must contain at least one uppercase letter", HttpStatusCode.BAD_REQUEST);
        }
        if (!/[0-9]/.test(data.newPassword)) {
            throw new AppError("New password must contain at least one number", HttpStatusCode.BAD_REQUEST);
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.newPassword)) {
            throw new AppError("New password must contain at least one special character", HttpStatusCode.BAD_REQUEST);
        }

        const hashedNewPassword = await bcrypt.hash(data.newPassword, config.BCRYPT_SALT_ROUNDS);
        await this._authRepository.updatePassword(userId, hashedNewPassword);
    }

    public async sendEmailUpdateOtp(userId: string, input: ISendEmailUpdateOtpInput): Promise<ISendEmailUpdateOtpResponse> {
        const currentUser = await this._authRepository.findById(userId);
        if (!currentUser) {
            throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const newEmail = input.newEmail.toLowerCase().trim();

        if (newEmail === currentUser.email) {
            throw new AppError(ErrorMessages.EMAIL_SAME_AS_CURRENT, HttpStatusCode.BAD_REQUEST);
        }

        const existingUser = await this._authRepository.findByEmail(newEmail);
        if (existingUser) {
            throw new AppError(ErrorMessages.EMAIL_ALREADY_EXISTS, HttpStatusCode.CONFLICT);
        }

        const otp = generateOtp();
        const hashedOtpValue = await hashOtp(otp);
        const otpExpiresAt = new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000);
        const expiresAt = new Date(Date.now() + config.OTP_TTL_SECONDS * 1000);

        await this._otpRepository.upsert(
            newEmail,
            hashedOtpValue,
            OTP_TYPE.EMAIL_UPDATE,
            otpExpiresAt,
            expiresAt,
            { name: currentUser.name, email: newEmail, role: currentUser.role, isBlocked: false }
        );

        await sendOtpEmail(newEmail, otp);

        return {
            success: true,
            message: SuccessMessages.EMAIL_UPDATE_OTP_SENT(newEmail, Math.floor(config.OTP_EXPIRY_SECONDS / 60)),
        };
    }

    public async verifyEmailUpdate(userId: string, input: IVerifyEmailUpdateInput): Promise<IVerifyEmailUpdateResponse> {
        const newEmail = input.newEmail.toLowerCase().trim();

        const otpEntry = await this._otpRepository.findByEmailAndType(newEmail, OTP_TYPE.EMAIL_UPDATE);
        if (!otpEntry) {
            throw new AppError(ErrorMessages.EMAIL_UPDATE_SESSION_EXPIRED, HttpStatusCode.BAD_REQUEST);
        }

        if (otpEntry.otpExpiresAt < new Date()) {
            throw new AppError(ErrorMessages.EMAIL_UPDATE_OTP_EXPIRED, HttpStatusCode.BAD_REQUEST);
        }

        const isValid = await compareOtp(input.otp, otpEntry.hashedOtp);
        if (!isValid) {
            throw new AppError(ErrorMessages.INVALID_EMAIL_UPDATE_OTP, HttpStatusCode.BAD_REQUEST);
        }

        const existingUser = await this._authRepository.findByEmail(newEmail);
        if (existingUser) {
            throw new AppError(ErrorMessages.EMAIL_ALREADY_EXISTS, HttpStatusCode.CONFLICT);
        }

        const updatedUser = await this._authRepository.updateById(userId, { email: newEmail } as Partial<IUser>);
        if (!updatedUser) {
            throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        await this._otpRepository.deleteByEmailAndType(newEmail, OTP_TYPE.EMAIL_UPDATE);

        return {
            success: true,
            message: SuccessMessages.EMAIL_UPDATED,
            data: mapUserToResponseDTO(updatedUser),
        };
    }

    public async resendEmailUpdateOtp(userId: string, input: IResendEmailUpdateOtpInput): Promise<IResendEmailUpdateOtpResponse> {
        const newEmail = input.newEmail.toLowerCase().trim();

        const otpEntry = await this._otpRepository.findByEmailAndType(newEmail, OTP_TYPE.EMAIL_UPDATE);
        if (!otpEntry) {
            throw new AppError(ErrorMessages.EMAIL_UPDATE_SESSION_EXPIRED, HttpStatusCode.BAD_REQUEST);
        }

        const otp = generateOtp();
        const hashedOtpValue = await hashOtp(otp);
        const otpExpiresAt = new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000);

        await this._otpRepository.updateOtp(newEmail, hashedOtpValue, OTP_TYPE.EMAIL_UPDATE, otpExpiresAt);
        await sendOtpEmail(newEmail, otp);

        return {
            success: true,
            message: SuccessMessages.EMAIL_UPDATE_OTP_RESENT(newEmail, Math.floor(config.OTP_EXPIRY_SECONDS / 60)),
        };
    }
}
