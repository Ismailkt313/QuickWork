import { IResetPasswordInput } from "../interfaces/auth.interface";
import { AppError } from "../../../utils/AppError";
import {HttpStatusCode} from "../../../constants/httpStatusCode"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export class ResetPasswordDto {
    public readonly email: string;
    public readonly otp: string;
    public readonly newPassword: string;

    private constructor(data: IResetPasswordInput) {
        this.email = data.email;
        this.otp = data.otp;
        this.newPassword = data.newPassword;
    }

    public static create(data: Partial<IResetPasswordInput>): ResetPasswordDto {
        const errors: string[] = [];

        if (!data.email || !EMAIL_REGEX.test(data.email)) {
            errors.push("A valid email is required");
        }

        if (!data.otp || data.otp.length !== 6) {
            errors.push("A valid 6-digit OTP is required");
        }

        if (!data.newPassword || data.newPassword.length < MIN_PASSWORD_LENGTH) {
            errors.push(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`);
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(". "), HttpStatusCode.BAD_REQUEST);
        }

        return new ResetPasswordDto(data as IResetPasswordInput);
    }
}
