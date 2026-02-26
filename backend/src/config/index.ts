import dotenv from "dotenv";

dotenv.config();

export const config = {
    PORT: parseInt(process.env.PORT || "5000", 10),
    MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/quickwork",
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "access_secret_dev",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "refresh_secret_dev",
    JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || "1h",
    JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || "7d",
    SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
    SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
    NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL ,
    NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
    OTP_EXPIRY_SECONDS: parseInt(process.env.OTP_EXPIRY_SECONDS || "120", 10),
    OTP_TTL_SECONDS: parseInt(process.env.OTP_TTL_SECONDS || "600", 10),
};
