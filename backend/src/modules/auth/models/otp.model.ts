import mongoose, { Schema } from "mongoose";
import { IOtpEntry } from "../interfaces/auth.interface";

const OtpEntrySchema: Schema<IOtpEntry> = new Schema<IOtpEntry>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        hashedOtp: {
            type: String,
            required: true,
        },
        userData: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            hashedPassword: { type: String, required: true },
            role: { type: String, required: true },
            isService_provider: { type: Boolean, required: true },
            isBlocked: { type: Boolean, default: false, required: true },
        },
        otpExpiresAt: {
            type: Date,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 },
        },
    },
    {
        timestamps: false,
    }
);

export const OtpEntryModel = mongoose.model<IOtpEntry>("OtpEntry", OtpEntrySchema);
