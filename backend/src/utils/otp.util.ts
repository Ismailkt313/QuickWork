import crypto from "crypto";
import bcrypt from "bcryptjs";
import { config } from "../config";

export const generateOtp = (): string => {
    const otp: string = crypto.randomInt(100000, 999999).toString();
    console.log("OTP sent successfully to : ", otp);
    return otp;
};

export const hashOtp = async (otp: string): Promise<string> => {
    return bcrypt.hash(otp, config.BCRYPT_SALT_ROUNDS);
};

export const compareOtp = async (otp: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(otp, hash);
};
