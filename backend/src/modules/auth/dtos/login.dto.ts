import { ILoginInput } from "../interfaces/auth.interface";
import { AppError } from "../../../utils/AppError";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class LoginDto {
    public readonly email: string;
    public readonly password: string;

    private constructor(data: ILoginInput) {
        this.email = data.email;
        this.password = data.password;
    }

    public static create(data: Partial<ILoginInput>): LoginDto {
        const errors: string[] = [];

        if (!data.email || !EMAIL_REGEX.test(data.email)) {
            errors.push("A valid email is required");
        }

        if (!data.password || data.password.trim().length === 0) {
            errors.push("Password is required");
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(". "), 400);
        }

        return new LoginDto(data as ILoginInput);
    }
}
