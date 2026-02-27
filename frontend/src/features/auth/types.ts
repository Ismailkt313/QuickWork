export type RegisterFormProps = {
  mode: "/login" | "/signup";
};

export type sendOtpPayload = {
    name: string,
    email: string,
    password: string,
    confirmPassword:string
}

export type loginPayload = {
    email: string
    password:string
}

export type otpPayload = {
    email: string
    otp:string
}