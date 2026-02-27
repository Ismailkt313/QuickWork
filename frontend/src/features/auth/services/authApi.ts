import { api } from "../../../api";

import type{ loginPayload, sendOtpPayload,otpPayload } from "../types";

export const sendOtp = async (data: sendOtpPayload) => {
    const response = await api.post('/auth/send-otp', data)
    return response.data
}

export const login = async (data: loginPayload) => {
    const response = await api.post('/auth/login',data)
    return response.data
}

export const OTP = async (data: otpPayload) => {
    const response = await api.post('/auth/verify-otp',data)
    return response.data
}