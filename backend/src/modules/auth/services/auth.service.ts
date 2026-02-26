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
    IRefreshTokenResponse,
    ITokenPayload,
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

    constructor(authRepository: IAuthRepository, otpRepository: IOtpRepository) {
        this.authRepository = authRepository;
        this.otpRepository = otpRepository;
    }

    public async sendOtp(input: ISendOtpInput): Promise<ISendOtpResponse> {
        const existingUser = await this.authRepository.findByEmail(input.email);
        if (existingUser) {
            throw new AppError("Email already exists", 409);
        }

        const isServiceProvider = input.role === "freelancer";

        const hashedPassword = await bcrypt.hash(
            input.password,
            config.BCRYPT_SALT_ROUNDS
        );

        const userData: ICreateUserData = {
            name: input.name.trim(),
            email: input.email.toLowerCase().trim(),
            hashedPassword,
            role: "client",
            isService_provider: isServiceProvider,
            isBlocked: false,
        };

        const otp = generateOtp();
        const hashedOtpValue = await hashOtp(otp);
        const otpExpiresAt = new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000);
        const expiresAt = new Date(Date.now() + config.OTP_TTL_SECONDS * 1000);

        await this.otpRepository.upsert(userData.email, hashedOtpValue, userData, otpExpiresAt, expiresAt);
        await sendOtpEmail(userData.email, otp);

        return {
            success: true,
            message: `OTP sent to ${userData.email}. Expires in ${Math.floor(config.OTP_EXPIRY_SECONDS / 60)} minutes`,
        };
    }

    public async verifyOtp(input: IVerifyOtpInput): Promise<IVerifyOtpResponse> {
        const otpEntry = await this.otpRepository.findByEmail(input.email.toLowerCase().trim());
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

        await this.authRepository.createUser(otpEntry.userData);
        await this.otpRepository.deleteByEmail(input.email);

        return {
            success: true,
            message: "Email verified and user registered successfully",
        };
    }

    public async resendOtp(input: IResendOtpInput): Promise<IResendOtpResponse> {
        const otpEntry = await this.otpRepository.findByEmail(input.email.toLowerCase().trim());
        if (!otpEntry) {
            throw new AppError("Registration session expired. Please register again", 400);
        }

        const otp = generateOtp();
        const hashedOtpValue = await hashOtp(otp);
        const otpExpiresAt = new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000);

        await this.otpRepository.updateOtp(otpEntry.email, hashedOtpValue, otpExpiresAt);
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
}
