import { IResendOtpInput } from "../interfaces/auth.interface";
import { AppError } from "../../../utils/AppError";
import {HttpStatusCode} from "../../../constants/httpStatusCode"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ResendOtpDto {
    public readonly email: string;

    private constructor(data: IResendOtpInput) {
        this.email = data.email;
    }

    public static create(data: Partial<IResendOtpInput>): ResendOtpDto {
        const errors: string[] = [];

        if (!data.email || !EMAIL_REGEX.test(data.email)) {
            errors.push("A valid email is required");
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(". "), HttpStatusCode.BAD_REQUEST);
        }

        return new ResendOtpDto(data as IResendOtpInput);
    }
}
