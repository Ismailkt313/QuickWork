import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/auth.interface";

const UserSchema: Schema<IUser> = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        number: {
            type: String,
            default: null,
        },
        hashedPassword: {
            type: String,
            select: false,
        },
        googleId: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ["user", "admin", "provider"],
            default: "user",
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
