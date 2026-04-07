import mongoose, { Schema } from "mongoose";
import { IOtpEntry } from "../interfaces/auth.interface";
import { OTP_TYPE } from "../../../constants/otp";
import { ROLES } from "../../../constants/roles";

const OtpEntrySchema: Schema<IOtpEntry> = new Schema<IOtpEntry>(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        hashedOtp: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(OTP_TYPE),
            required: true,
        },
        userData: {
            name: { type: String, required: false },
            email: { type: String, required: false },
            hashedPassword: { type: String, required: false },
            role: { type: String, enum: Object.values(ROLES), required: false },
            isBlocked: { type: Boolean, default: false },
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

OtpEntrySchema.index({ email: 1, type: 1 }, { unique: true });

export const OtpEntryModel = mongoose.model<IOtpEntry>("OtpEntry", OtpEntrySchema);
