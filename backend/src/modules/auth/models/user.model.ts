import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/auth.interface";
import { ROLES } from "../../../constants/roles";

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
            enum: Object.values(ROLES),
            default: ROLES.USER,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        warningCount: {
            type: Number,
            default: 0,
        },
        profileImage: {
            url: { type: String, default: null },
            public_id: { type: String, default: null },
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
