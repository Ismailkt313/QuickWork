import crypto from "crypto";
import bcrypt from "bcryptjs";
import { config } from "../config";

export const generateOtp = (): string => {
    const otp = crypto.randomInt(100000, 999999);
    console.log(otp)
    return otp.toString();
};

export const hashOtp = async (otp: string): Promise<string> => {
    return bcrypt.hash(otp, config.BCRYPT_SALT_ROUNDS);
};

export const compareOtp = async (otp: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(otp, hash);
};
