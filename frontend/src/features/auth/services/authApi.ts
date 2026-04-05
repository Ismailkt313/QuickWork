import { api } from "../../../services/api";

import type { loginPayload, sendOtpPayload, otpPayload, resendOtpPayload } from "../types";

export const sendOtp = async (data: sendOtpPayload) => {
    const response = await api.post('/auth/send-otp', data)
    return response.data
}

export const login = async (data: loginPayload) => {
    const response = await api.post('/auth/login', data)
    console.log("Login API Response:", response.data);
    return response.data
}

export const OTP = async (data: otpPayload) => {
    const response = await api.post('/auth/verify-otp', data)
    return response.data
}

export const resendOtp = async (data: resendOtpPayload) => {
    const response = await api.post('/auth/resend-otp', data)
    return response.data
}

export const logout = async (data: { refreshToken: string }) => {
    const response = await api.post('/auth/logout', data)
    return response.data
}

export const forgotPassword = async (data: { email: string }) => {
    const response = await api.post('/auth/forgot-password', data)
    return response.data
}

export const resetPassword = async (data: any) => {
    const response = await api.post('/auth/reset-password', data)
    return response.data
}

export const updateProfile = async (data: { name?: string; number?: string }) => {
    const response = await api.patch('/auth/profile', data)
    return response.data
}

export const changePassword = async (data: any) => {
    const response = await api.post('/auth/change-password', data)
    return response.data
}

export const getMe = async () => {
    const response = await api.get('/auth/me')
    return response.data
}
