import { ISendOtpInput } from "../interfaces/auth.interface";
import { AppError } from "../../../utils/AppError";
import {HttpStatusCode} from "../../../constants/httpStatusCode"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export class SendOtpDto {
    public readonly name: string;
    public readonly email: string;
    public readonly password: string;
    public readonly confirmPassword: string;
    public readonly role: ISendOtpInput["role"];

    private constructor(data: ISendOtpInput) {
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.confirmPassword = data.confirmPassword;
        this.role = data.role;
    }

    public static create(data: Partial<ISendOtpInput>): SendOtpDto {
        const errors: string[] = [];

        if (!data.name || data.name.trim().length === 0) {
            errors.push("Name is required");
        }

        if (!data.email || !EMAIL_REGEX.test(data.email)) {
            errors.push("A valid email is required");
        }

        if (!data.password || data.password.length < MIN_PASSWORD_LENGTH) {
            errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
        }

        if (!data.confirmPassword || data.password !== data.confirmPassword) {
            errors.push("Passwords do not match");
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(". "), HttpStatusCode.BAD_REQUEST);
        }

        return new SendOtpDto(data as ISendOtpInput);
    }
}
