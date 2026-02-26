import nodemailer from "nodemailer";
import { config } from "../config";

const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: false,
    auth: {
        user: config.NODEMAILER_EMAIL,
        pass: config.NODEMAILER_PASSWORD,
    },
});

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
    await transporter.sendMail({
        from: `"QuickWork" <${config.NODEMAILER_EMAIL}>`,
        to,
        subject: "QuickWork - Email Verification OTP",
        html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
                <h2 style="color:#1a1a2e;margin-bottom:16px;">Verify Your Email</h2>
                <p style="color:#4a4a68;font-size:15px;">Use the OTP below to complete your registration. This code expires in <strong>${Math.floor(config.OTP_EXPIRY_SECONDS / 60)} minutes</strong>.</p>
                <div style="background:#1a1a2e;color:#ffffff;font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:16px;border-radius:8px;margin:24px 0;">
                    ${otp}
                </div>
                <p style="color:#888;font-size:13px;">If you did not request this, please ignore this email.</p>
            </div>
        `,
    });
};
