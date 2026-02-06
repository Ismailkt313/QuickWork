import mongoose, { Schema, Document } from 'mongoose'

export interface IUSER extends Document {
    name: string
    email: string
    number: Number
    hashedPassword: string
    googleId: string
    role: 'clint' | 'admin' | 'provider'
    isBlocked: Boolean
    refreshToken: string
}

const userSchema = new Schema<IUSER>(
    {
        name: { type: String },
        email: { type: String, required: true, unique: true },
        number: { type: Number},
        hashedPassword: { type: String },
        googleId: { type: String },
        role: { type: String, enum: ['clint', 'admin', 'provider'] ,default:'clint'},
        isBlocked: { type: Boolean, default: false },
        refreshToken:{type:String}
    },
    {timestamps:true}
)

 export const User = mongoose.model<IUSER>('User',userSchema)