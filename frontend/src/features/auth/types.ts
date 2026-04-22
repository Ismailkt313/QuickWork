import { ROLES } from "../../constants/roles";

export type RegisterFormProps = {
  mode: "/auth/login" | "/auth/signup";
};

export type sendOtpPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: ROLES;
};

export type resendOtpPayload = {
  email: string;
};

export type loginPayload = {
  email: string;
  password: string;
};

export type otpPayload = {
  email: string;
  otp: string;
};

export type forgotPasswordPayload = {
  email: string;
};

export type resetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
};
