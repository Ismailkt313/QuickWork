import nodemailer from 'nodemailer'
import { env } from '@config/env'

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.nodemailerEmail,
        pass: env.nodemailerPassword
    }
})
export const sendOTP = async (email: string, otp: string) => {
    try {
        await transporter.sendMail({
        from: "QUICKWORK TEAM",
        to: email,
        subject: 'YOUR OTP',
        html: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
        `,
        
        })
        return true
    } catch (error) {
        console.log('nodemailer error ',error)
        return false
    }
}