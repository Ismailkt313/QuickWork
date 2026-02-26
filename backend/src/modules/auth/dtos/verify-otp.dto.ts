import { IVerifyOtpInput } from "../interfaces/auth.interface";
import { AppError } from "../../../utils/AppError";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{6}$/;

export class VerifyOtpDto {
    public readonly email: string;
    public readonly otp: string;

    private constructor(data: IVerifyOtpInput) {
        this.email = data.email;
        this.otp = data.otp;
    }

    public static create(data: Partial<IVerifyOtpInput>): VerifyOtpDto {
        const errors: string[] = [];

        if (!data.email || !EMAIL_REGEX.test(data.email)) {
            errors.push("A valid email is required");
        }

        if (!data.otp || !OTP_REGEX.test(data.otp)) {
            errors.push("OTP must be a 6-digit number");
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(". "), 400);
        }

        return new VerifyOtpDto(data as IVerifyOtpInput);
    }
}
