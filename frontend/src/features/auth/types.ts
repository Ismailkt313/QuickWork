export type RegisterFormProps = {
    mode: "/login" | "/signup";
};

export type sendOtpPayload = {
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    role?: "user" | "admin"
}

export type resendOtpPayload = {
    email: string
}

export type loginPayload = {
    email: string
    password: string
}

export type otpPayload = {
    email: string
    otp: string
}

export type forgotPasswordPayload = {
    email: string
}

export type resetPasswordPayload = {
    email: string
    otp: string
    newPassword: string
}