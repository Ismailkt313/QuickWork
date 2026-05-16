import { ILocation, IPortfolioItem } from '../interfaces/serviceProvider.interface';
import { AppError } from '../../../utils/AppError';
import {HttpStatusCode} from "../../../constants/httpStatusCode"

export interface SubmitApplicationInput {
    headline?: string;
    about?: string;
    profileImage?: string;
    skills?: string[];
    yearsOfExperience?: number | string;
    hourlyRate?: number | string;
    location?: ILocation;
    portfolio?: IPortfolioItem[];
    [key: string]: unknown;
}

export class SubmitApplicationDTO {
    public readonly headline: string;
    public readonly about: string;
    public readonly profileImage: string;
    public readonly skills: string[];
    public readonly yearsOfExperience: number;
    public readonly hourlyRate: number;
    public readonly location: ILocation;
    public readonly portfolio: IPortfolioItem[];

    private constructor(data: SubmitApplicationInput) {
        this.headline = data.headline!;
        this.about = data.about!;
        this.profileImage = data.profileImage!;
        this.skills = data.skills!;
        this.yearsOfExperience = Number(data.yearsOfExperience);
        this.hourlyRate = Number(data.hourlyRate);
        this.location = data.location!;
        this.portfolio = data.portfolio!;
    }

    public static create(data: SubmitApplicationInput): SubmitApplicationDTO {
        const errors: string[] = [];

        if (!data.headline || data.headline.trim().length === 0) {
            errors.push("Headline is required");
        }

        if (!data.about || data.about.trim().length < 80) {
            errors.push("About section must be at least 80 characters long");
        }

        if (!data.profileImage || data.profileImage.trim().length === 0) {
            errors.push("Profile image is required");
        }

        if (!data.skills || !Array.isArray(data.skills) || data.skills.length === 0) {
            errors.push("At least one skill is required");
        }

        if (data.yearsOfExperience === undefined || isNaN(Number(data.yearsOfExperience)) || Number(data.yearsOfExperience) < 0) {
            errors.push("Valid years of experience is required");
        }

        if (!data.hourlyRate || isNaN(Number(data.hourlyRate)) || Number(data.hourlyRate) <= 0) {
            errors.push("Valid hourly rate greater than 0 is required");
        }

        if (!data.location || !data.location.id || !data.location.name) {
            errors.push("Complete location data is required");
        }

        if (!data.portfolio || !Array.isArray(data.portfolio) || data.portfolio.length === 0) {
            errors.push("At least one portfolio item is required");
        } else {
            data.portfolio.forEach((item: IPortfolioItem, index: number) => {
                if (!item.title || item.title.trim().length === 0) {
                    errors.push(`Portfolio item ${index + 1} requires a title`);
                }
                if (!item.images || !Array.isArray(item.images) || item.images.length === 0) {
                    errors.push(`Portfolio item ${index + 1} requires at least one image`);
                }
            });
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(". "), HttpStatusCode.BAD_REQUEST);
        }

        return new SubmitApplicationDTO(data);
    }
}
