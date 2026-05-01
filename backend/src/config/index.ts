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
    NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL,
    NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
    OTP_EXPIRY_SECONDS: parseInt(process.env.OTP_EXPIRY_SECONDS || "120", 10),
    OTP_TTL_SECONDS: parseInt(process.env.OTP_TTL_SECONDS || "600", 10),
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    CLOUD_NAME: process.env.CLOUD_NAME || "",
    CLOUD_API_KEY: process.env.CLOUD_API_KEY || "",
    CLOUD_API_SECRET: process.env.CLOUD_API_SECRET || "",
    url: process.env.URL,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
    VERCEL_URL: process.env.VERCEL_URL,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
    AWS_REGION: process.env.AWS_REGION || "ap-south-1",
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || "",

};

