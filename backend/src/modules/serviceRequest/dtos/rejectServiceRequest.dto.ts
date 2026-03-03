import { AppError } from "../../../utils/AppError";

export class RejectServiceRequestDTO {
    public readonly rejectionReason: string;

    private constructor(data: any) {
        this.rejectionReason = data.rejectionReason;
    }

    public static create(data: any): RejectServiceRequestDTO {
        const errors: string[] = [];

        if (!data.rejectionReason || data.rejectionReason.trim().length === 0) {
            errors.push("Rejection reason is required");
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(". "), 400);
        }

        return new RejectServiceRequestDTO(data);
    }
}
