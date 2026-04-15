import { AppError } from "../../../utils/AppError";
import { HttpStatusCode } from "../../../constants/httpStatusCode"

export class CreateServiceRequestDTO {
    public readonly name: string;
    public readonly description: string;

    private constructor(data: any) {
        this.name = data.name;
        this.description = data.description;
    }

    public static create(data: any): CreateServiceRequestDTO {
        const errors: string[] = [];

        if (!data.name || data.name.trim().length === 0) {
            errors.push("Skill name is required");
        }

        if (!data.description || data.description.trim().length === 0) {
            errors.push("Description is required");
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(". "), HttpStatusCode.BAD_REQUEST);
        }

        return new CreateServiceRequestDTO(data);
    }
}
