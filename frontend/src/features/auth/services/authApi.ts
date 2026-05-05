import { api } from "../../../services/api";
import { ENDPOINTS } from "../../../constants/endpoints";

import type {
  loginPayload,
  sendOtpPayload,
  otpPayload,
  resendOtpPayload,
} from "../types";

export const sendOtp = async (data: sendOtpPayload) => {
  const response = await api.post(ENDPOINTS.AUTH.SEND_OTP, data);
  return response.data;
};

export const login = async (data: loginPayload) => {
  const response = await api.post(ENDPOINTS.AUTH.LOGIN, data);
  console.log("Login API Response:", response.data);
  return response.data;
};

export const OTP = async (data: otpPayload) => {
  const response = await api.post(ENDPOINTS.AUTH.VERIFY_OTP, data);
  return response.data;
};

export const resendOtp = async (data: resendOtpPayload) => {
  const response = await api.post(ENDPOINTS.AUTH.RESEND_OTP, data);
  return response.data;
};

export const logout = async (data?: { refreshToken: string }) => {
  const response = await api.post(ENDPOINTS.AUTH.LOGOUT, data || {});
  return response.data;
};

export const forgotPassword = async (data: { email: string }) => {
  const response = await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  return response.data;
};

export const resetPassword = async (data: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const response = await api.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
  return response.data;
};

export const updateProfile = async (data: {
  name?: string;
  number?: string;
  profileImage?: { url: string; public_id: string } | null;
}) => {
  const response = await api.patch(ENDPOINTS.AUTH.PROFILE, data);
  return response.data;
};

export const changePassword = async (data: {
  currentPassword?: string;
  newPassword?: string;
}) => {
  const response = await api.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  console.log('data',response)
  return response.data;
};

export const getMe = async () => {
  const response = await api.get(ENDPOINTS.AUTH.ME);
  return response.data;
};
