import mongoose, { Document, Schema } from 'mongoose'

export interface IOtp extends Document {
    email: string,
    otp: string
    expiresAt:Date
}

const otpSchema = new Schema<IOtp>({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: {
        type: Date,
        required: true,
        expires:120,
    }
})
export const otp = mongoose.model<IOtp>('otp',otpSchema)