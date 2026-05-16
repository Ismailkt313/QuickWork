import { AppError } from "../../../utils/AppError";
import { HttpStatusCode } from "../../../constants/httpStatusCode";

export interface RejectServiceRequestInput {
    rejectionReason?: string;
    [key: string]: unknown;
}

export class RejectServiceRequestDTO {
    public readonly rejectionReason: string;

    private constructor(data: RejectServiceRequestInput) {
        this.rejectionReason = data.rejectionReason!;
    }

    public static create(data: RejectServiceRequestInput): RejectServiceRequestDTO {
        const errors: string[] = [];

        if (!data.rejectionReason || data.rejectionReason.trim().length === 0) {
            errors.push("Rejection reason is required");
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(". "), HttpStatusCode.BAD_REQUEST);
        }

        return new RejectServiceRequestDTO(data);
    }
}
