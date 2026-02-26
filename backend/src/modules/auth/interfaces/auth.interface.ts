import { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    number?: string;
    hashedPassword: string;
    googleId?: string;
    role: "client" | "admin";
    isService_provider: boolean;
    isBlocked: boolean;
    createdAt: Date;
}

export interface ICreateUserData {
    name: string;
    email: string;
    number?: string;
    hashedPassword: string;
    googleId?: string;
    role: "client" | "admin";
    isService_provider: boolean;
    isBlocked: boolean;
}

export interface IOtpEntry extends Document {
    email: string;
    hashedOtp: string;
    userData: ICreateUserData;
    otpExpiresAt: Date;
    expiresAt: Date;
}

export interface ISendOtpInput {
    name: string;
    email: string;
    password: string;
    role: "user" | "freelancer";
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

export interface ILoginInput {
    email: string;
    password: string;
}

export interface ITokenPayload {
    userId: string;
    role: "client" | "admin";
}

export interface ILoginResponse {
    success: boolean;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
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

export interface IOtpRepository {
    upsert(email: string, hashedOtp: string, userData: ICreateUserData, otpExpiresAt: Date, expiresAt: Date): Promise<void>;
    findByEmail(email: string): Promise<IOtpEntry | null>;
    deleteByEmail(email: string): Promise<void>;
    updateOtp(email: string, hashedOtp: string, otpExpiresAt: Date): Promise<void>;
}

export interface IAuthRepository {
    findByEmail(email: string): Promise<IUser | null>;
    findByEmailWithPassword(email: string): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
    createUser(data: ICreateUserData): Promise<IUser>;
}

export interface IAuthService {
    sendOtp(input: ISendOtpInput): Promise<ISendOtpResponse>;
    verifyOtp(input: IVerifyOtpInput): Promise<IVerifyOtpResponse>;
    resendOtp(input: IResendOtpInput): Promise<IResendOtpResponse>;
    login(input: ILoginInput): Promise<ILoginResponse>;
    refreshToken(token: string): Promise<IRefreshTokenResponse>;
}