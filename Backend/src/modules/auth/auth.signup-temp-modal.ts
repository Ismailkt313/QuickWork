import mongoose, { Schema, Document } from 'mongoose'

export interface ISignUPTemp extends Document {
    email: string,
    password: string,
    expiresAt:Date
}

const tempSignup = new Schema<ISignUPTemp>(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
        expiresAt: {
            type: Date,
            required: true,
            expires:300
        }
    }
)  
export const signupTemp = mongoose.model<ISignUPTemp>('signupTemp',tempSignup)