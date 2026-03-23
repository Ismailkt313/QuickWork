import { Document } from "mongoose";
import type { UserResponseDTO } from "../dtos/userResponse.dto";

export interface    IUser extends Document {
    name: string;
    email: string;
    number?: string;
    hashedPassword?: string;
    googleId?: string;
    role: "user" | "admin" | "provider";
    isBlocked: boolean;
    createdAt: Date;
}

export interface ICreateUserData {
    name: string;
    email: string;
    number?: string;
    hashedPassword?: string;
    googleId?: string;
    role: "user" | "admin" | "provider";
    isBlocked: boolean;
}

export interface IOtpEntry extends Document {
    email: string;
    hashedOtp: string;
    type: "registration" | "password-reset";
    userData?: ICreateUserData;
    otpExpiresAt: Date;
    expiresAt: Date;
}

export interface ISendOtpInput {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: "user" | "admin" | "provider";
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
    role: "user" | "admin" | "provider";
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

export interface ILogoutResponse {
    success: boolean;
    message: string;
}

export interface IOtpRepository {
    upsert(email: string, hashedOtp: string, type: "registration" | "password-reset", otpExpiresAt: Date, expiresAt: Date, userData?: ICreateUserData): Promise<void>;
    findByEmailAndType(email: string, type: "registration" | "password-reset"): Promise<IOtpEntry | null>;
    deleteByEmailAndType(email: string, type: "registration" | "password-reset"): Promise<void>;
    updateOtp(email: string, hashedOtp: string, type: "registration" | "password-reset", otpExpiresAt: Date): Promise<void>;
    deleteByRefreshToken(token: string): Promise<void>;
}

export interface IAuthRepository {
    findByEmail(email: string): Promise<IUser | null>;
    findByEmailWithPassword(email: string): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
    createUser(data: ICreateUserData): Promise<IUser>;
    updatePassword(userId: string, hashedPassword: string): Promise<void>;
    updateUserRole(userId: string, role: "user" | "admin" | "provider"): Promise<void>;
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
}
