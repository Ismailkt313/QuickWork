import { AppError } from "../../../utils/AppError";

export class CreateLocationDTO {
    public readonly name: string;
    public readonly lat: number;
    public readonly lon: number;

    private constructor(data: any) {
        this.name = data.name;
        this.lat = data.lat;
        this.lon = data.lon;
    }

    public static create(data: any): CreateLocationDTO {
        const errors: string[] = [];

        if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
            errors.push("Location name is required and must be a string");
        }

        if (data.lat === undefined || typeof data.lat !== "number") {
            errors.push("Latitude (lat) is required and must be a number");
        }

        if (data.lon === undefined || typeof data.lon !== "number") {
            errors.push("Longitude (lon) is required and must be a number");
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(". "), 400);
        }

        return new CreateLocationDTO(data);
    }
}
