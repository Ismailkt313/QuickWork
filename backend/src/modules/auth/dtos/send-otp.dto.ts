import { ISendOtpInput } from "../interfaces/auth.interface";
import { AppError } from "../../../utils/AppError";

const VALID_ROLES: ISendOtpInput["role"][] = ["user", "freelancer"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export class SendOtpDto {
    public readonly name: string;
    public readonly email: string;
    public readonly password: string;
    public readonly role: ISendOtpInput["role"];

    private constructor(data: ISendOtpInput) {
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
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

        if (!data.role || !VALID_ROLES.includes(data.role as ISendOtpInput["role"])) {
            errors.push(`Role must be one of: ${VALID_ROLES.join(", ")}`);
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(". "), 400);
        }

        return new SendOtpDto(data as ISendOtpInput);
    }
}
