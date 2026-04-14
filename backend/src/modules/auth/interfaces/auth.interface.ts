import { Document } from "mongoose";
import type { UserResponseDTO } from "../dtos/userResponse.dto";
import { ROLES } from "../../../constants/roles";
import { OTP_TYPE } from "../../../constants/otp";

export interface    IUser extends Document {
    name: string;
    email: string;
    number?: string;
    hashedPassword?: string;
    googleId?: string;
    role: ROLES;
    profileImage?: {
        url: string;
        public_id: string;
    };
    isBlocked: boolean;
    createdAt: Date;
}

export interface ICreateUserData {
    name: string;
    email: string;
    number?: string;
    hashedPassword?: string;
    googleId?: string;
    role: ROLES;
    isBlocked: boolean;
}

export interface IOtpEntry extends Document {
    email: string;
    hashedOtp: string;
    type: OTP_TYPE;
    userData?: ICreateUserData;
    otpExpiresAt: Date;
    expiresAt: Date;
}

export interface ISendOtpInput {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: ROLES;
}

export interface IVerifyOtpInput {
    email: string;
    otp: string;
}

export interface IResendOtpInput {
    email: string;
}

export interface ISendOtpResponse {
    success: boolean;
    message: string;
}

export interface IVerifyOtpResponse {
    success: boolean;
    message: string;
}

export interface IResendOtpResponse {
    success: boolean;
    message: string;
}

export interface IForgotPasswordInput {
    email: string;
}

export interface IForgotPasswordResponse {
    success: boolean;
    message: string;
}

export interface IResetPasswordInput {
    email: string;
    otp: string;
    newPassword: string;
}

export interface IResetPasswordResponse {
    success: boolean;
    message: string;
}

export interface ILoginInput {
    email: string;
    password: string;
}

export interface ITokenPayload {
    userId: string;
    role: ROLES;
}

export interface ILoginResponse {
    success: boolean;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
        user: UserResponseDTO;
    };
}

export interface IAdminLoginResponse {
    success: boolean;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
        admin: UserResponseDTO;
    };
}

export interface IRefreshTokenResponse {
    success: boolean;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
    };
}

export interface IChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}

export interface IUpdateProfileInput {
    name?: string;
    number?: string;
    profileImage?: {
        url: string;
        public_id: string;
    };
}

export interface ILogoutResponse {
    success: boolean;
    message: string;
}

export interface IOtpRepository {
    upsert(email: string, hashedOtp: string, type: OTP_TYPE, otpExpiresAt: Date, expiresAt: Date, userData?: ICreateUserData): Promise<void>;
    findByEmailAndType(email: string, type: OTP_TYPE): Promise<IOtpEntry | null>;
    deleteByEmailAndType(email: string, type: OTP_TYPE): Promise<void>;
    updateOtp(email: string, hashedOtp: string, type: OTP_TYPE, otpExpiresAt: Date): Promise<void>;
    deleteByRefreshToken(token: string): Promise<void>;
}

export interface IAuthRepository {
    findByEmail(email: string): Promise<IUser | null>;
    findByEmailWithPassword(email: string): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
    createUser(data: ICreateUserData): Promise<IUser>;
    updatePassword(userId: string, hashedPassword: string): Promise<void>;
    updateUserRole(userId: string, role: ROLES): Promise<void>;
    updateUser(userId: string, data: Partial<IUser>): Promise<IUser | null>;
}

export interface IAuthService {
    sendOtp(input: ISendOtpInput): Promise<ISendOtpResponse>;
    verifyOtp(input: IVerifyOtpInput): Promise<IVerifyOtpResponse>;
    resendOtp(input: IResendOtpInput): Promise<IResendOtpResponse>;
    login(input: ILoginInput): Promise<ILoginResponse>;
    adminLogin(input: ILoginInput): Promise<IAdminLoginResponse>;
    refreshToken(token: string): Promise<IRefreshTokenResponse>;
    logout(token: string): Promise<ILogoutResponse>;
    forgotPassword(input: IForgotPasswordInput): Promise<IForgotPasswordResponse>;
    resetPassword(input: IResetPasswordInput): Promise<IResetPasswordResponse>;
    getProfile(userId: string): Promise<UserResponseDTO>;
    updateProfile(userId: string, data: IUpdateProfileInput): Promise<UserResponseDTO>;
    changePassword(userId: string, data: IChangePasswordInput): Promise<void>;
}
