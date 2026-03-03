import { IForgotPasswordInput } from "../interfaces/auth.interface";
import { AppError } from "../../../utils/AppError";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ForgotPasswordDto {
    public readonly email: string;

    private constructor(data: IForgotPasswordInput) {
        this.email = data.email;
    }

    public static create(data: Partial<IForgotPasswordInput>): ForgotPasswordDto {
        const errors: string[] = [];

        if (!data.email || !EMAIL_REGEX.test(data.email)) {
            errors.push("A valid email is required");
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(". "), 400);
        }

        return new ForgotPasswordDto(data as IForgotPasswordInput);
    }
}
